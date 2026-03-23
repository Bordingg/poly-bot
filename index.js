const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const PROXY_WALLET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Dette er Polymarkets "Hjerte" (CTF Kontrakten)
const CTF_ADDRESS = "0x2713101e4E9f03635C2B3E691656CB5CD27dfD71";
const CTF_ABI = ["event PositionSplit(address indexed stakeholder, address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] partition, uint256 amount)"];

console.log("Overvåger Polymarket Core (PositionSplit)...");
bot.sendMessage(CHAT_ID, "🧬 Nu lytter jeg direkte på Polymarkets hjerte for: " + PROXY_WALLET);

const contract = new ethers.Contract(CTF_ADDRESS, CTF_ABI, provider);

contract.on("PositionSplit", (stakeholder, collateral, parent, condition, partition, amount, event) => {
    if (stakeholder.toLowerCase() === PROXY_WALLET) {
        const msg = `🎯 **POPOSITION OPDATERET!**\n\n` +
                    `Du har lige foretaget en handel på Polymarket.\n` +
                    `Se detaljer her: https://polygonscan.com/tx/${event.log.transactionHash}`;
        
        bot.sendMessage(CHAT_ID, msg);
    }
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
