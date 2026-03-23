const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET_WALLET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.JsonRpcProvider(RPC_URL);

const EXCHANGES = [
    { name: "Standard", address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E" },
    { name: "Neg Risk", address: "0xC5d563A36AE78145C45a50134d48A1215220f80a" },
    { name: "CTF Exchange", address: "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6" }
];

const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

console.log("Systemet lytter nu...");
bot.sendMessage(CHAT_ID, "✅ Botten er online. Jeg lytter efter trades nu!");

EXCHANGES.forEach(exchange => {
    const contract = new ethers.Contract(exchange.address, ABI, provider);
    
    contract.on("OrderFilled", (maker, taker, orderHash) => {
        const m = maker.toLowerCase();
        const t = taker.toLowerCase();
        
        // VI TJEKKER BÅDE DIN PROXY OG DIN EOA HER
        // Sørg for at TARGET_WALLET i Railway er: 0x39966e0093C920B2C935E517f1fA5b57A3d1b4f
        if (m === TARGET_WALLET || t === TARGET_WALLET) {
            bot.sendMessage(CHAT_ID, `🎯 MATCH! En trade er fundet.\nLink: https://polygonscan.com/tx/${orderHash}`);
        }
    });
});
