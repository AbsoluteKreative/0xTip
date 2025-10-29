# 0xTip

An onchain tipping platform with rewards for creators and supporters.

Submission for Solana Cypherpunk Hackathon - Colosseum (2025)

## features

- connect wallet (phantom, solflare)
- browse creator profiles
- send SOL tips to creators (on devnet)
- automatic splitting (95% creator earnings, 5% platform fee)
- rewards system (cashback on every 3rd tip)
- supporter dashboard with stats and progress tracking
- view supporter history on creator pages
- clean, minimal ui

## blockchain architecture

**current implementation:**
- atomic multi-instruction transactions (both transfers succeed or both fail)
- on-chain transaction verification
- transparent, immutable tip history on Solana
- cryptographic signatures for all transfers
- decentralized tip records (anyone can verify on explorer)

## tech stack

**frontend:**
- solana web3.js
- wallet-adapter (react)
- next.js 16 (app router)
- typescript
- tailwind css

**backend:**
- solana web3.js (for reward transactions)
- express.js
- sqlite (better-sqlite3)

## getting started

### prerequisites

- node.js 18+
- phantom or solflare wallet (browser extension)
- devnet SOL (get from [solana faucet](https://faucet.solana.com/))

### installation

```bash
npm install
```

### configuration

copy the env template and set your values:

```bash
cp .env.example .env
```

edit `.env`:
```bash
# wallet that gets the 5% cut
PLATFORM_WALLET=3CDMm7U2iNF6WHU2TRoGbf29ajYgfch3qcYdtRbjJk5m

# path to keypair json
PLATFORM_WALLET_KEYPAIR_PATH=./wallets/platform-wallet.json

# rpc endpoint
SOLANA_RPC_URL=https://api.devnet.solana.com

# backend port
PORT=3001

# frontend vars (NEXT_PUBLIC_ = visible in browser)
NEXT_PUBLIC_API_URL=http://localhost:3001

# 0.05 = 5% to platform
NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=0.05

# 0.005 = 0.5% cashback each
LOYALTY_REWARD_PERCENTAGE=0.005
```

generate platform wallet:
```bash
node scripts/generate-platform-wallet.js
```

this creates a new keypair, saves to `wallets/platform-wallet.json`, and updates `.env`.

or just drop your own keypair json at the path above.

### run the app

quickest way (runs both):
```bash
npm run dev:all
```

frontend -> http://localhost:3000
backend -> http://localhost:3001

or run separately in two terminals:
```bash
npm run server  # terminal 1
npm run dev     # terminal 2
```

### usage

1. connect your wallet using the button in top right
2. make sure you're on devnet and have some devnet SOL
3. browse creators on homepage
4. click a creator to view their profile
5. enter tip amount and send
6. view transaction on solana explorer
7. check "my dashboard" to see your stats, progress, and rewards
8. Both creator and supporter get 1% i.e. 0.50% each of sum total of every 3 transactions between them in rewards i.e. air-dropped in their wallets.

## project structure

```
/app
  /page.tsx              # homepage with creator list
  /layout.tsx            # root layout with wallet provider
  /creator/[id]/page.tsx # individual creator page
  /profile/page.tsx      # supporter dashboard
/components
  /WalletProvider.tsx    # solana wallet context provider
  /WalletButton.tsx      # wallet connect button
  /TipButton.tsx         # send SOL tip component + reward UI
  /SupporterList.tsx     # display recent supporters
/lib
  /creators.ts           # creator data structure
  /config.ts             # configuration (loads from env vars)
/server
  /index.js              # express api server
  /db.js                 # database setup
  /tips.db               # database (auto-generated)
/scripts
  /generate-platform-wallet.js  # generate platform wallet keypair
/wallets
  /platform-wallet.json  # platform keypair (gitignored)
.env                     # environment variables (gitignored)
.env.example             # env template (committed)
```

## platform fee system

every tip is automatically split in a single transaction:
- **95%** goes to the creator
- **5%** goes to the platform wallet

example: if a user tips 1 SOL:
- creator receives: 0.95 SOL
- platform receives: 0.05 SOL

the split happens client-side using two transfer instructions in one transaction. no custom solana program needed.

to change the fee percentage, edit `NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE` in your `.env` file.

## rewards

Both creator and supporter get 1% i.e. 0.50% each of sum total of every 3 transactions between them in rewards i.e. air-dropped in their wallets.

every 3rd tip from same supporter -> same creator triggers cashback:
- supporter gets 0.5% reward
- creator gets 0.5% reward
- paid from platform wallet (our collected fees)

example flow:
- tip #1: 0.1 SOL → nothing
- tip #2: 0.1 SOL → nothing
- tip #3: 0.1 SOL → reward! (0.3 SOL total * 1% = 0.0030 SOL i.e. 0.0015 SOL each)
- tip #4-5: nothing
- tip #6: reward again

implementation: backend tracks tips in sql db, counts per supporter->creator pair, sends reward tx on every 3rd. frontend shows animated notification w/ explorer link.

## supporter dashboard

hit `/profile` or "my dashboard" link.

shows:
- aggregate stats (tips sent, SOL tipped, cashback earned w/ coin graphics, creators supported)
- per-creator breakdown (tip count, amount, cashback, progress bar toward next reward)
- last 10 tips w/ timestamps + explorer links
- all rewards ever received w/ explorer links

## adding creators

edit `lib/creators.ts` to add new creators:

```typescript
{
  id: "unique-id",
  name: "creator name",
  description: "what they do",
  walletAddress: "solana wallet address",
  goal: "optional funding goal",
  avatar: "emoji"
}
```

## next steps for production

- [ ] add proper database for creator profiles
- [ ] implement recurring subscriptions
- [ ] add creator dashboard
- [ ] content gating for supporters
- [ ] analytics and tracking
- [ ] move to mainnet
- [ ] add more payment options

## network

currently configured for **solana devnet**.

to switch networks, edit these environment variables in `.env`:
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # for mainnet
SOLANA_NETWORK=mainnet-beta
```

also update the wallet provider network in `components/WalletProvider.tsx` line 14.

## deployment

set env vars on your host (vercel/netlify/railway/whatever):

```bash
PLATFORM_WALLET=your_platform_wallet_address
PLATFORM_WALLET_KEYPAIR_PATH=/path/to/keypair.json
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PORT=3001

NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=0.05
LOYALTY_REWARD_PERCENTAGE=0.005
```

platform keypair: keep it safe - use secrets manager, encrypted env vars, or mount as volume for docker.

database: sqlite fine for hackathon. for prod, migrate to postgres.

## notes

- currently on devnet (testnet), no real money
- supporter list shows last 10 transactions per creator
- all secrets managed via environment variables
- platform wallet needs SOL to pay rewards

Submission for Solana Cypherpunk Hackathon - Colosseum (2025)
