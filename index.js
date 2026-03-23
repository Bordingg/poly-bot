const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Fejlfinding starter...");
bot.sendMessage(CHAT_ID, "🔎 Jeg tjekker nu, om jeg overhovedet kan se Polygon-netværket...");

// Denne lytter på HVERT ENESTE blok-nummer der bliver lavet (ca. hvert 2. sekund)
provider.on("block", (blockNumber) => {
    console.log("Ny blok fundet: " + blockNumber);
    // Vi sender kun en besked hver 10. blok, så vi ikke spammer din Telegram
    if (blockNumber % 10 === 0) {
        bot.sendMessage(CHAT_ID, "✅ Forbindelse bekræftet! Jeg ser lige nu blok nr: " + blockNumber);
    }
});

provider.on("error", (e) => {
    console.error("WSS Forbindelsesfejl:", e);
    bot.sendMessage(CHAT_ID, "❌ Forbindelsen til Alchemy fejlede: " + e.message);
});
