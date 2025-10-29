require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// env vars w/ fallbacks
const PLATFORM_WALLET_KEYPAIR_PATH = process.env.PLATFORM_WALLET_KEYPAIR_PATH || path.join(__dirname, "..", "wallets", "platform-wallet.json");
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const LOYALTY_REWARD_PERCENTAGE = parseFloat(process.env.LOYALTY_REWARD_PERCENTAGE || "0.005");
const PORT = process.env.PORT || 3001;

// load platform keypair (from env var or file)
let platformKeypair;
if (process.env.PLATFORM_WALLET_SECRET_KEY) {
  // from env var (for production/fly.io)
  platformKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.PLATFORM_WALLET_SECRET_KEY))
  );
} else {
  // from file (for local dev)
  const platformKeypairPath = path.isAbsolute(PLATFORM_WALLET_KEYPAIR_PATH)
    ? PLATFORM_WALLET_KEYPAIR_PATH
    : path.join(__dirname, "..", PLATFORM_WALLET_KEYPAIR_PATH);

  platformKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(platformKeypairPath, "utf8")))
  );
}

console.log("✓ platform wallet loaded:", platformKeypair.publicKey.toString());

// rpc connection
const connection = new Connection(SOLANA_RPC_URL, "confirmed");
console.log("✓ connected to:", SOLANA_RPC_URL);

// POST /api/tip - records tip + maybe sends loyalty reward
app.post("/api/tip", async (req, res) => {
  try {
    const { supporterWallet, creatorWallet, amountSol, txSignature } = req.body;

    if (!supporterWallet || !creatorWallet || !amountSol || !txSignature) {
      return res.status(400).json({ error: "missing required fields" });
    }

    // save to db
    const stmt = db.prepare(
      "INSERT INTO tips (supporter_wallet, creator_wallet, amount_sol, timestamp, tx_signature) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(supporterWallet, creatorWallet, amountSol, Date.now(), txSignature);

    console.log(`✓ recorded tip: ${supporterWallet} -> ${creatorWallet}: ${amountSol} SOL`);

    // count tips from this supporter to this creator
    const tipCount = db
      .prepare("SELECT COUNT(*) as count FROM tips WHERE supporter_wallet = ? AND creator_wallet = ?")
      .get(supporterWallet, creatorWallet);

    console.log(`  tip count for this supporter->creator: ${tipCount.count}`);

    let reward = null;

    // loyalty reward kicks in every 3rd tip
    if (tipCount.count % 3 === 0 && tipCount.count > 0) {
      console.log("  → loyalty reward triggered!");

      // grab last 3 tips to calculate reward amount
      const last3Tips = db
        .prepare(
          "SELECT amount_sol FROM tips WHERE supporter_wallet = ? AND creator_wallet = ? ORDER BY id DESC LIMIT 3"
        )
        .all(supporterWallet, creatorWallet);

      const totalLast3 = last3Tips.reduce((sum, tip) => sum + tip.amount_sol, 0);
      console.log(`  total of last 3 tips: ${totalLast3} SOL`);

      // 0.5% each from our platform cut
      const supporterReward = totalLast3 * LOYALTY_REWARD_PERCENTAGE;
      const creatorReward = totalLast3 * LOYALTY_REWARD_PERCENTAGE;

      console.log(`  supporter reward: ${supporterReward} SOL`);
      console.log(`  creator reward: ${creatorReward} SOL`);

      // send from platform wallet
      try {
        const transaction = new Transaction();

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: platformKeypair.publicKey,
            toPubkey: new PublicKey(supporterWallet),
            lamports: Math.floor(supporterReward * LAMPORTS_PER_SOL),
          })
        );

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: platformKeypair.publicKey,
            toPubkey: new PublicKey(creatorWallet),
            lamports: Math.floor(creatorReward * LAMPORTS_PER_SOL),
          })
        );

        const signature = await connection.sendTransaction(transaction, [platformKeypair]);
        await connection.confirmTransaction(signature, "confirmed");

        console.log(`  ✓ rewards sent! tx: ${signature}`);

        // log reward to db
        const rewardStmt = db.prepare(
          `INSERT INTO rewards (supporter_wallet, creator_wallet, supporter_amount_sol, creator_amount_sol, total_tips_amount_sol, tx_signature, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        rewardStmt.run(
          supporterWallet,
          creatorWallet,
          supporterReward,
          creatorReward,
          totalLast3,
          signature,
          Date.now()
        );

        // total cashback this supporter's earned across all creators
        const totalCashback = db
          .prepare("SELECT SUM(supporter_amount_sol) as total FROM rewards WHERE supporter_wallet = ?")
          .get(supporterWallet);

        reward = {
          supporterReward,
          creatorReward,
          totalLast3,
          txSignature: signature,
          totalCashbackEarned: totalCashback.total || 0,
        };
      } catch (error) {
        console.error("  ✗ failed to send rewards:", error.message);
        // keep going - reward failure shouldn't kill the whole request
      }
    }

    res.json({
      success: true,
      tipCount: tipCount.count,
      reward,
    });
  } catch (error) {
    console.error("error processing tip:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/supporter/:wallet - dashboard data
app.get("/api/supporter/:wallet", (req, res) => {
  try {
    const { wallet } = req.params;

    // aggregate tip stats
    const totalTips = db
      .prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount_sol), 0) as total FROM tips WHERE supporter_wallet = ?")
      .get(wallet);

    const totalRewards = db
      .prepare("SELECT COALESCE(SUM(supporter_amount_sol), 0) as total FROM rewards WHERE supporter_wallet = ?")
      .get(wallet);

    // per-creator breakdown
    const creatorsSupported = db
      .prepare(`
        SELECT
          creator_wallet,
          COUNT(*) as tip_count,
          SUM(amount_sol) as total_amount,
          MAX(timestamp) as last_tip_timestamp
        FROM tips
        WHERE supporter_wallet = ?
        GROUP BY creator_wallet
        ORDER BY tip_count DESC, total_amount DESC
      `)
      .all(wallet);

    // calc progress toward next reward (0/3, 1/3, 2/3)
    const creatorsWithProgress = creatorsSupported.map(creator => {
      const rewardsEarned = db
        .prepare("SELECT COALESCE(SUM(supporter_amount_sol), 0) as total FROM rewards WHERE supporter_wallet = ? AND creator_wallet = ?")
        .get(wallet, creator.creator_wallet);

      return {
        ...creator,
        next_reward_progress: creator.tip_count % 3,
        tips_until_reward: 3 - (creator.tip_count % 3),
        rewards_earned: rewardsEarned.total,
      };
    });

    // last 10 tips
    const recentTips = db
      .prepare("SELECT * FROM tips WHERE supporter_wallet = ? ORDER BY timestamp DESC LIMIT 10")
      .all(wallet);

    // all rewards ever
    const rewardHistory = db
      .prepare("SELECT * FROM rewards WHERE supporter_wallet = ? ORDER BY timestamp DESC")
      .all(wallet);

    res.json({
      overview: {
        total_tips_sent: totalTips.count,
        total_sol_tipped: totalTips.total,
        total_cashback_earned: totalRewards.total,
        creators_supported: creatorsSupported.length,
      },
      creators: creatorsWithProgress,
      recent_tips: recentTips,
      reward_history: rewardHistory,
    });
  } catch (error) {
    console.error("error fetching supporter stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", platformWallet: platformKeypair.publicKey.toString() });
});

app.listen(PORT, () => {
  console.log(`\n✓ 0xTip backend running on http://localhost:${PORT}`);
  console.log(`  platform wallet: ${platformKeypair.publicKey.toString()}\n`);
});
