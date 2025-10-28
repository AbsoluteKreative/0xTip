const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "tips.db"));

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
