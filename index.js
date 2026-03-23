const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
const TARGET_WALLET = process.env.TARGET_WALLET.toLowerCase();

const bot = new TelegramBot(TOKEN);
// VIGTIGT: Vi bruger WebSocketProvider her
const provider = new ethers.WebSocketProvider(RPC_URL);

const EXCHANGES = [
    { name: "Standard", address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E" },
    { name: "Neg Risk", address: "0xC5d563A36AE78145C45a50134d48A1215220f80a" },
    { name: "CTF Exchange", address: "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6" }
];

// Forenklet ABI - vi lytter bare efter adresserne
const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

console.log("Botten lytter nu live via WSS...");
bot.sendMessage(CHAT_ID, "📡 LIVE: Jeg lytter nu via WebSockets på: " + TARGET_WALLET);

EXCHANGES.forEach(exchange => {
    const contract = new ethers.Contract(exchange.address, ABI, provider);
    
    contract.on("OrderFilled", (maker, taker, orderHash) => {
        console.log("Trade opdaget på blockchainen..."); // Dette ses i Railway logs
        
        const isMaker = maker.toLowerCase() === TARGET_WALLET;
        const isTaker = taker.toLowerCase() === TARGET_WALLET;

        if (isMaker || isTaker) {
            const msg = `🎯 **NY TRADE FUNDET!**\n\n` +
                        `Marked: ${exchange.name}\n` +
                        `Rolle: ${isMaker ? "Sælger (Maker)" : "Køber (Taker)"}\n\n` +
                        `Se her: https://polygonscan.com/tx/${orderHash}`;
            
            bot.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' });
        }
    });
});

// Fejlhåndtering hvis forbindelsen ryger
provider._websocket.on("error", (e) => console.error("WSS Fejl:", e));
provider._websocket.on("close", () => console.log("WSS Forbindelse lukket"));
