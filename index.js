const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f";

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Vi laver et filter der lytter efter ALLE indgående overførsler til din adresse
const filter = {
    topics: [
        ethers.id("Transfer(address,address,uint256)"), // Selve overførsels-signalet
        null, // Vi er ligeglade med hvem afsenderen er
        ethers.zeroPadValue(TARGET, 32) // Din adresse formateret korrekt til 32 bytes
    ]
};

console.log("Starter rettet overvågning...");

bot.sendMessage(CHAT_ID, "✅ Botten er rettet og lytter nu på alt indgående til: " + TARGET);

provider.on(filter, (log) => {
    const txHash = log.transactionHash;
    bot.sendMessage(CHAT_ID, `📦 **INDIREKTE TRADE DETEKTERET!**\n\nNoget er lige landet i din wallet (sandsynligvis shares).\n\nSe transaktion: https://polygonscan.com/tx/${txHash}`);
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
