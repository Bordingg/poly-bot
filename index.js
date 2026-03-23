const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Dine to adresser
const MY_WALLETS = [
    "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase(),
    "0x7210DD22a1461e6F44701d3d97f4A9f452B144E1".toLowerCase()
];

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Polymarkets hoved-kontrakter
const CONTRACTS = [
    { name: "CTF Exchange", addr: "0x4bFbE613D23355A48f4E9A65817d23f03b86E6c6" },
    { name: "Neg Risk Adapter", addr: "0xC5d563A36AE78145C45a50134d48A1215220f80a" }
];

// Vi lytter efter 'OrderFilled'
const ABI = ["event OrderFilled(address indexed maker, address indexed taker, bytes32 orderHash, uint256 makerAmountFilled, uint256 takerAmountFilled)"];

console.log("Starter Polymarket Special-overvågning...");
bot.sendMessage(CHAT_ID, "🔍 Nu overvåger jeg Polymarkets egne handels-kontrakter direkte!");

CONTRACTS.forEach(c => {
    const contract = new ethers.Contract(c.addr, ABI, provider);
    
    contract.on("OrderFilled", (maker, taker, orderHash, makerAmt, takerAmt, event) => {
        const m = maker.toLowerCase();
        const t = taker.toLowerCase();

        // Hvis en af dine wallets er involveret
        if (MY_WALLETS.includes(m) || MY_WALLETS.includes(t)) {
            const side = MY_WALLETS.includes(t) ? "KØBT" : "SOLGT";
            
            const msg = `🎯 **NY POLYMARKET TRADE!**\n\n` +
                        `Handling: ${side}\n` +
                        `Kontrakt: ${c.name}\n\n` +
                        `Se transaktion: https://polygonscan.com/tx/${event.log.transactionHash}`;
            
            bot.sendMessage(CHAT_ID, msg);
        }
    });
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
