const { Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

console.log("generating platform wallet...\n");

const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toString();
const secretKey = Array.from(keypair.secretKey);

// mkdir if needed
const outputDir = path.join(__dirname, "..", "wallets");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// write keypair json
const keypairPath = path.join(outputDir, "platform-wallet.json");
fs.writeFileSync(keypairPath, JSON.stringify(secretKey));

console.log("✓ platform wallet generated successfully!\n");
console.log("public key (wallet address):");
console.log(publicKey);
console.log("\n");
console.log("private key saved to:");
console.log(keypairPath);
console.log("\n");
console.log("IMPORTANT: keep platform-wallet.json safe and private!");
console.log("this file contains your private key.\n");
console.log("to import into phantom:");
console.log("1. open phantom");
console.log("2. click menu (top left) -> add / connect wallet");
console.log("3. click 'import private key'");
console.log("4. paste the secret key from platform-wallet.json");
console.log("   (the entire array including brackets)");
console.log("\n");
console.log("updating .env...");

// update .env file
const envPath = path.join(__dirname, "..", ".env");
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(
    /PLATFORM_WALLET=.*/,
    `PLATFORM_WALLET=${publicKey}`
  );
} else {
  envContent = `PLATFORM_WALLET=${publicKey}\nPLATFORM_WALLET_KEYPAIR_PATH=./wallets/platform-wallet.json\n`;
}
fs.writeFileSync(envPath, envContent);

console.log("✓ .env updated w/ new wallet address\n");
console.log("done!");
