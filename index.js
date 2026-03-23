const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;
// Din Proxy-adresse (den med pengene)
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Rå transaktions-overvågning starter...");
bot.sendMessage(CHAT_ID, "🦾 OVERVÅGNING AKTIVERET!\n\nJeg overvåger nu din wallet direkte på blockchain-niveau: " + TARGET);

// Vi lytter på ALLE nye transaktioner på netværket
provider.on("pending", async (txHash) => {
    try {
        const tx = await provider.getTransaction(txHash);
        
        // Hvis transaktionen involverer din wallet (enten som afsender eller modtager)
        if (tx && (tx.from.toLowerCase() === TARGET || (tx.to && tx.to.toLowerCase() === TARGET))) {
            
            const msg = `🔔 **AKTIVITET PÅ DIN WALLET!**\n\n` +
                        `Der er lige sket en bevægelse!\n` +
                        `Se her: https://polygonscan.com/tx/${txHash}`;
            
            bot.sendMessage(CHAT_ID, msg);
        }
    } catch (err) {
        // Vi ignorerer fejl for transaktioner der forsvinder hurtigt
    }
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
