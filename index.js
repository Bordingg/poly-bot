const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET_WALLET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
// Vi bruger WebSocketProvider til live overvågning
const provider = new ethers.WebSocketProvider(RPC_URL);

const EXCHANGES = [
    { name: "Standard", address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E" },
    { name: "Neg Risk", address: "0xC5d563A36AE78145C45a50134d48A1215220f80a" },
    { name: "CTF Exchange", address: "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6" }
];

const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

console.log("Botten starter op...");

// En simpel start-besked så vi ved den kører
bot.sendMessage(CHAT_ID, "🚀 Botten er nu LIVE og overvåger: " + TARGET_WALLET);

EXCHANGES.forEach(exchange => {
    try {
        const contract = new ethers.Contract(exchange.address, ABI, provider);
        
        contract.on("OrderFilled", (maker, taker, orderHash) => {
            const m = maker.toLowerCase();
            const t = taker.toLowerCase();
            
            if (m === TARGET_WALLET || t === TARGET_WALLET) {
                const msg = `🎯 **NY TRADE FUNDET!**\n\n` +
                            `Marked: ${exchange.name}\n` +
                            `Wallet: ${TARGET_WALLET}\n\n` +
                            `Se transaktion: https://polygonscan.com/tx/${orderHash}`;
                
                bot.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' });
            }
        });
    } catch (err) {
        console.error("Fejl ved opsætning af exchange: " + exchange.name, err);
    }
});

// Simpel fejlhåndtering for at undgå crash
provider.on("error", (error) => {
    console.error("Provider fejl:", error);
});
