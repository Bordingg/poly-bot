const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// USDC Token kontrakt adresse på Polygon
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDC_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];

console.log("Starter global USDC-overvågning...");
bot.sendMessage(CHAT_ID, "💰 Botten overvåger nu alle dine penge-bevægelser (USDC) på: " + TARGET);

const contract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

contract.on("Transfer", (from, to, value, event) => {
    const fromAddr = from.toLowerCase();
    const toAddr = to.toLowerCase();

    if (fromAddr === TARGET || toAddr === TARGET) {
        const amount = Number(value) / 1000000; // USDC har 6 decimaler
        const type = fromAddr === TARGET ? "📉 Du har KØBT eller SENDT" : "📈 Du har MODTAGET eller SOLGT";
        
        const msg = `💰 **NY BEVÆGELSE FUNDET!**\n\n` +
                    `Type: ${type}\n` +
                    `Beløb: $${amount.toFixed(2)}\n\n` +
                    `Se her: https://polygonscan.com/tx/${event.log.transactionHash}`;
        
        bot.sendMessage(CHAT_ID, msg);
    }
});

provider.on("error", (e) => console.log("Provider fejl:", e));
