const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Polymarkets "Hjerte" - her bor alle aktier (Conditional Tokens)
const CTF_ADDRESS = "0x2713101e4E9f03635C2B3E691656CB5CD27dfD71";
const CTF_ABI = ["event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)"];

console.log("Overvåger Polymarket Shares...");

const ctfContract = new ethers.Contract(CTF_ADDRESS, CTF_ABI, provider);

bot.sendMessage(CHAT_ID, "🎯 Nu overvåger jeg dine Polymarket-AKTIER direkte for: " + TARGET);

ctfContract.on("TransferSingle", (operator, from, to, id, value, event) => {
    if (to.toLowerCase() === TARGET || from.toLowerCase() === TARGET) {
        const type = to.toLowerCase() === TARGET ? "KØBT" : "SOLGT";
        const msg = `🎭 **POLYMARKET TRADE DETEKTERET!**\n\nHandling: ${type}\nAntal shares: ${value.toString()}\n\nSe her: https://polygonscan.com/tx/${event.log.transactionHash}`;
        bot.sendMessage(CHAT_ID, msg);
    }
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
