# testing the loyalty rewards system

## quick setup

1. **fund your platform wallet**
   ```bash
   # get your platform wallet address (already done during setup)
   # address: 3CDMm7U2iNF6WHU2TRoGbf29ajYgfch3qcYdtRbjJk5m
   ```

   - import platform wallet into phantom (use `wallets/platform-wallet.json`)
   - switch to devnet in phantom
   - go to https://faucet.solana.com/
   - paste platform wallet address
   - get 2-5 devnet SOL (needed to pay rewards)

2. **run both servers**
   ```bash
   npm run dev:all
   ```

3. **connect your main wallet**
   - connect via phantom on http://localhost:3000
   - make sure you have some devnet SOL

## testing flow

### test 1: verify platform gets fees

1. pick any creator from homepage
2. send 1 SOL tip
3. check phantom:
   - your balance: -1.00x SOL (tip + gas)
   - platform wallet: +0.05 SOL (5% fee)
   - creator wallet: +0.95 SOL (95% payment)

### test 2: trigger loyalty reward (3rd tip)

**important:** you need to tip the SAME creator 3 times from the SAME wallet

1. send 1st tip: 0.1 SOL to creator
   - success message shows "tip #1 to this creator"
   - no reward notification

2. send 2nd tip: 0.1 SOL to same creator
   - success message shows "tip #2 to this creator"
   - no reward notification

3. send 3rd tip: 0.1 SOL to same creator
   - success message shows "tip #3 to this creator"
   - **reward notification appears!**
   - shows:
     - your cashback: +0.0015 SOL
     - creator bonus: +0.0015 SOL
     - based on last 3 tips: 0.3 SOL total

4. check wallets:
   - your wallet: received +0.0015 SOL cashback
   - creator wallet: received +0.0015 SOL bonus
   - platform wallet: sent out -0.003 SOL (both rewards)

5. send 4th, 5th tip → no reward

6. send 6th tip → **reward triggered again!**

### test 3: different amounts

1. tip creator: 0.5 SOL (1st tip)
2. tip creator: 1.0 SOL (2nd tip)
3. tip creator: 2.0 SOL (3rd tip)
   - total: 3.5 SOL
   - reward: 0.5% each = 0.0175 SOL each

### test 4: multiple creators

the counter is per supporter->creator pair:
- tip creator A: 3 times → reward on 3rd
- tip creator B: 2 times → no reward yet
- tip creator A: again → reward on 6th (to creator A)
- tip creator B: 1 more → reward on 3rd (to creator B)

## checking the database

want to see what's tracked?

```bash
sqlite3 server/tips.db

# see all tips
SELECT * FROM tips;

# see rewards
SELECT * FROM rewards;

# count tips per supporter->creator
SELECT supporter_wallet, creator_wallet, COUNT(*) as tips
FROM tips
GROUP BY supporter_wallet, creator_wallet;
```

## troubleshooting

**reward not showing up?**
- check backend logs (terminal running `npm run server`)
- platform wallet needs SOL to send rewards
- check browser console for errors

**"failed to notify backend" error?**
- make sure backend is running on http://localhost:3001
- check `npm run server` output

**no SOL received?**
- check transaction on solana explorer (click the link)
- might take a few seconds to show in phantom
- refresh phantom balance

**platform wallet running out of SOL?**
- platform collects 5% fees
- pays out 1% in rewards (0.5% + 0.5%)
- net profit: 4% per tip
- if you're testing a lot, airdrop more to platform wallet

## expected behavior

**on 1st tip:**
- backend logs: "recorded tip", "tip count: 1"
- no reward logic runs

**on 3rd tip:**
- backend logs: "recorded tip", "tip count: 3", "loyalty reward triggered!"
- backend logs: "rewards sent! tx: [signature]"
- frontend shows animated purple reward notification
- both wallets receive SOL

**platform wallet balance:**
- should grow from fees faster than it shrinks from rewards
- 5% in, 1% out = 4% net profit per tip cycle
