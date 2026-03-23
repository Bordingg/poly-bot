const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

// Vi henter dine hemmelige koder fra Railway bagefter
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET_WALLET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Polymarkets "markedsplads" adresse
const CTF_EXCHANGE = "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6";
const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

const contract = new ethers.Contract(CTF_EXCHANGE, ABI, provider);
bot.sendMessage(CHAT_ID, "Test: Botten er nu online og forbundet til din Telegram!");

console.log("Botten starter... Overvåger " + TARGET_WALLET);

contract.on("OrderFilled", (maker, taker, orderHash) => {
    if (maker.toLowerCase() === TARGET_WALLET || taker.toLowerCase() === TARGET_WALLET) {
        const msg = `🎯 DE KLOGE PENGE TRADER!\n\nWallet: ${TARGET_WALLET}\n\nSe her: https://polygonscan.com/tx/${orderHash}`;
        bot.sendMessage(CHAT_ID, msg);
    }
});
