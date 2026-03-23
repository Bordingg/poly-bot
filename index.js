const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Vi definerer adressen her og tvinger den til små bogstaver med det samme
const rawAddress = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Starter skudsikker overvågning...");

// Vi bygger filteret manuelt uden at bruge drilske hjælpefunktioner
const filter = {
    topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        "0x000000000000000000000000" + rawAddress.replace("0x", "")
    ]
};

bot.sendMessage(CHAT_ID, "🛡️ Botten er nu i 'Safe Mode' og overvåger: " + rawAddress);

provider.on(filter, (log) => {
    try {
        const txHash = log.transactionHash;
        bot.sendMessage(CHAT_ID, `🎯 **HANDEL FUNDET!**\n\nDer er aktivitet på din Polymarket-konto.\nSe her: https://polygonscan.com/tx/${txHash}`);
    } catch (e) {
        console.error("Kunne ikke sende besked:", e);
    }
});

provider.on("error", (e) => console.log("WSS Netværksfejl:", e));
