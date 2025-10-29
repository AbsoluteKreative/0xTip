const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// use volume in production, local dir in dev
const dbDir = process.env.DB_PATH || __dirname;
const dbPath = path.join(dbDir, "tips.db");

// ensure dir exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// tips table - all transactions
db.exec(`
  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supporter_wallet TEXT NOT NULL,
    creator_wallet TEXT NOT NULL,
    amount_sol REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    tx_signature TEXT NOT NULL
  )
`);

// rewards table - loyalty payouts we've sent
db.exec(`
  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supporter_wallet TEXT NOT NULL,
    creator_wallet TEXT NOT NULL,
    supporter_amount_sol REAL NOT NULL,
    creator_amount_sol REAL NOT NULL,
    total_tips_amount_sol REAL NOT NULL,
    tx_signature TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )
`);

console.log("✓ database initialized");

module.exports = db;
