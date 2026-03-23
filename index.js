const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Vi fjerner '0x' og manuelt tilføjer de nuller som blockchainen vil have
const TARGET_CLEAN = "39966e0093C920B2C935E517f1fA5b57A3d1b4f";
const PADDED_ADDRESS = "0x000000000000000000000000" + TARGET_CLEAN;

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Vi lytter efter 'Transfer' eventet (0xddf252ad...) direkte
const filter = {
    topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", 
        null, 
        PADDED_ADDRESS.toLowerCase()
    ]
};

console.log("Starter ultra-stabil overvågning...");

bot.sendMessage(CHAT_ID, "🚀 Botten er nu genstartet med 'Safe-Mode'. Jeg lytter efter alt der lander hos dig!");

provider.on(filter, (log) => {
    try {
        const txHash = log.transactionHash;
        bot.sendMessage(CHAT_ID, `📦 **HANDEL DETEKTERET!**\n\nDer er landet noget i din wallet.\nSe her: https://polygonscan.com/tx/${txHash}`);
    } catch (e) {
        console.log("Fejl ved afsendelse af besked");
    }
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
