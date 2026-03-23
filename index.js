const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET_WALLET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Her er de 3 vigtigste markedspladser på Polymarket
const EXCHANGES = [
    { name: "Standard", address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E" },
    { name: "Neg Risk", address: "0xC5d563A36AE78145C45a50134d48A1215220f80a" },
    { name: "CTF Exchange", address: "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6" }
];

const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

console.log("Botten starter... Overvåger ALLE markeder for: " + TARGET_WALLET);
bot.sendMessage(CHAT_ID, "🚀 Overvågning opdateret! Jeg holder nu øje med alle markeder.");

// Vi laver en lytter for hver markedsplads
EXCHANGES.forEach(exchange => {
    const contract = new ethers.Contract(exchange.address, ABI, provider);
    
    contract.on("OrderFilled", (maker, taker, orderHash) => {
        if (maker.toLowerCase() === TARGET_WALLET || taker.toLowerCase() === TARGET_WALLET) {
            const msg = `🎯 **NY TRADE FUNDET!**\n\n` +
                        `Markedstype: ${exchange.name}\n` +
                        `Wallet: ${TARGET_WALLET}\n\n` +
                        `Se her: https://polygonscan.com/tx/${orderHash}`;
            
            bot.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' });
        }
    });
});
