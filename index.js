const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// VI OVERVÅGER BEGGE DINE ADRESSER HER
const ADRESSE_1 = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();
const ADRESSE_2 = "0x7210DD22a1461e6F44701d3d97f4A9f452B144E1".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDC_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];

console.log("Dobbelt-overvågning starter...");
bot.sendMessage(CHAT_ID, "🛡️ Dobbelt-overvågning aktiveret!\n\nJeg holder øje med både din Proxy og din EOA nu.");

const contract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

contract.on("Transfer", (from, to, value, event) => {
    const f = from.toLowerCase();
    const t = to.toLowerCase();

    if (f === ADRESSE_1 || t === ADRESSE_1 || f === ADRESSE_2 || t === ADRESSE_2) {
        const amount = Number(value) / 1000000;
        bot.sendMessage(CHAT_ID, `💰 **BEVÆGELSE DETEKTERET!**\n\nBeløb: $${amount.toFixed(2)}\nTX: https://polygonscan.com/tx/${event.log.transactionHash}`);
    }
});

provider.on("error", (e) => console.log("Provider fejl:", e));
