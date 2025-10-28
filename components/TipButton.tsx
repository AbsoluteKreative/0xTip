"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { PLATFORM_WALLET, PLATFORM_FEE_PERCENTAGE, API_URL } from "@/lib/config";
import Link from "next/link";

interface TipButtonProps {
  creatorWallet: string;
  creatorName: string;
}

interface RewardInfo {
  supporterReward: number;
  creatorReward: number;
  totalLast3: number;
  txSignature: string;
  totalCashbackEarned: number;
}

export default function TipButton({
  creatorWallet,
  creatorName,
}: TipButtonProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0.1");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [txSignature, setTxSignature] = useState("");
  const [reward, setReward] = useState<RewardInfo | null>(null);
  const [tipCount, setTipCount] = useState<number>(0);
  const [rewardPulsing, setRewardPulsing] = useState(false);

  const sendTip = async () => {
    if (!publicKey) {
      alert("please connect your wallet first");
      return;
    }

    try {
      setStatus("sending");

      // split: 95% creator, 5% platform
      const totalLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const platformFeeLamports = Math.floor(
        totalLamports * PLATFORM_FEE_PERCENTAGE,
      );
      const creatorLamports = totalLamports - platformFeeLamports;

      // build tx w/ two transfers
      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(creatorWallet),
          lamports: creatorLamports,
        }),
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PLATFORM_WALLET),
          lamports: platformFeeLamports,
        }),
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);

      // tell backend -> it checks if loyalty reward should trigger
      try {
        const response = await fetch(`${API_URL}/api/tip`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supporterWallet: publicKey.toString(),
            creatorWallet: creatorWallet,
            amountSol: parseFloat(amount),
            txSignature: signature,
          }),
        });

        const data = await response.json();
        console.log("backend response:", data);

        setTipCount(data.tipCount);

        if (data.reward) {
          setReward(data.reward);
          setRewardPulsing(true);
          // pulse for 10s then stay static
          setTimeout(() => setRewardPulsing(false), 10000);
          // to auto-hide after 10s, uncomment:
          // setTimeout(() => setReward(null), 10000);
        }
      } catch (backendError) {
        console.error("failed to notify backend:", backendError);
        // tx already went through, keep going
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("tip failed:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">send a tip</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.1"
            min="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.1"
          />
        </div>

        <div className="flex gap-2">
          {[0.1, 0.5, 1, 5].map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {amt} SOL
            </button>
          ))}
        </div>

        {parseFloat(amount) > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>creator receives:</span>
              <span className="font-medium">
                {(parseFloat(amount) * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(
                  4,
                )}{" "}
                SOL (95%)
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>platform fee:</span>
              <span className="font-medium">
                {(parseFloat(amount) * PLATFORM_FEE_PERCENTAGE).toFixed(4)} SOL
                (5%)
              </span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
              <span>total:</span>
              <span>{parseFloat(amount).toFixed(4)} SOL</span>
            </div>
          </div>
        )}

        <button
          onClick={sendTip}
          disabled={!publicKey || status === "sending"}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {status === "sending" ? "sending..." : `tip ${creatorName}`}
        </button>

        {status === "success" && txSignature && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium mb-3">
              tip sent successfully!{" "}
              {tipCount > 0 && `(tip #${tipCount} to this creator)`}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 text-xs underline"
              >
                view on explorer
              </a>
              <Link
                href="/profile"
                className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                my dashboard →
              </Link>
            </div>
          </div>
        )}

        {reward && (
          <div
            className={`p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg ${rewardPulsing ? "animate-pulse" : ""}`}
          >
            <p className="text-purple-900 font-bold mb-2">🎉 loyalty reward!</p>
            <p className="text-purple-800 text-sm mb-3">
              congrats on your 3rd tip! you and the creator both earned cashback
              rewards:
            </p>
            <div className="space-y-2 bg-white/50 rounded p-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">your cashback:</span>
                <span className="font-semibold text-purple-900">
                  +{reward.supporterReward.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">creator bonus:</span>
                <span className="font-semibold text-purple-900">
                  +{reward.creatorReward.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2 mt-2">
                <span className="text-purple-700 font-medium">
                  total cashback earned:
                </span>
                <span className="font-bold text-purple-900">
                  {reward.totalCashbackEarned.toFixed(4)} SOL
                </span>
              </div>
              <div className="text-xs text-purple-600 pt-2 border-t border-purple-200">
                based on your last 3 tips ({reward.totalLast3.toFixed(4)} SOL
                total)
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-purple-200">
              <a
                href={`https://explorer.solana.com/tx/${reward.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 text-xs underline"
              >
                view reward transaction
              </a>
              <Link
                href="/profile"
                className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                my dashboard→
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              transaction failed. please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
