const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Vi lytter KUN på USDC-kontrakten - det elsker Alchemy
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDC_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];

console.log("Starter USDC-specifik overvågning...");

const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

bot.sendMessage(CHAT_ID, "✅ Botten er online! Jeg overvåger nu alle USDC-bevægelser for: " + TARGET);

// Vi lytter efter når du modtager penge (køb af aktier/salg)
usdcContract.on("Transfer", (from, to, value, event) => {
    if (to.toLowerCase() === TARGET || from.toLowerCase() === TARGET) {
        const amount = Number(value) / 1000000;
        const msg = `💰 **USDC BEVÆGELSE DETEKTERET!**\n\nBeløb: $${amount.toFixed(2)}\nTX: https://polygonscan.com/tx/${event.log.transactionHash}`;
        bot.sendMessage(CHAT_ID, msg);
    }
});

provider.on("error", (e) => console.log("WSS Netværksfejl:", e));
