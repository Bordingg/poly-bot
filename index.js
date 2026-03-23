const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Den store "motor"-adresse (Relayeren)
const RELAYER_ADDRESS = "0x7210DD22a1461e6F44701d3d97f4A9f452B144E1".toLowerCase();
// DIN personlige konto-ID (Proxyen)
const MY_PROXY = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Starter præcisions-overvågning...");
bot.sendMessage(CHAT_ID, "🎯 Botten er nu fintunet! Jeg lytter kun efter dine egne handler nu.");

provider.on("pending", async (txHash) => {
    try {
        const tx = await provider.getTransaction(txHash);
        
        // TJEK 1: Kommer transaktionen fra motoren?
        // TJEK 2: Indeholder transaktionens data DIN unikke adresse?
        if (tx && tx.from.toLowerCase() === RELAYER_ADDRESS) {
            if (tx.data.toLowerCase().includes(MY_PROXY.replace("0x", ""))) {
                
                const msg = `💰 **DIN HANDEL ER REGISTRERET!**\n\n` +
                            `Jeg har fundet din specifikke handel i mængden.\n\n` +
                            `Se transaktion: https://polygonscan.com/tx/${txHash}`;
                
                bot.sendMessage(CHAT_ID, msg);
            }
        }
    } catch (e) {
        // Fejl ignoreres for at holde botten kørende
    }
});

provider.on("error", (e) => console.log("WSS Netværksfejl:", e));
