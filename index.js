const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Vi lytter efter ALLE "Transfer" events på hele Polygon, hvor DU er modtageren
const filter = {
    topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        ethers.zeroPadValue(TARGET, 32) // Din adresse som modtager
    ]
};

console.log("Lytter efter alt der lander i din wallet...");
bot.sendMessage(CHAT_ID, "📥 Jeg overvåger nu alt, der lander i din wallet (Shares og USDC): " + TARGET);

provider.on(filter, (log) => {
    const txHash = log.transactionHash;
    bot.sendMessage(CHAT_ID, `📦 **Noget landede i din wallet!**\n\nDet er sandsynligvis din Polymarket-trade.\nSe den her: https://polygonscan.com/tx/${txHash}`);
});

provider.on("error", (e) => console.log("Fejl:", e));
