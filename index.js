const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// DIN RIGTIGE ADRESSE FRA BILLEDET
const MY_ADDRESS = "0x7210DD22a1461e6F44701d3d97f4A9f452B144E1".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Starter overvågning af aktiv adresse...");

bot.sendMessage(CHAT_ID, "🚀 BOT ER LIVE! Overvåger nu din aktive wallet: " + MY_ADDRESS);

// Vi lytter på transaktioner fra din adresse
provider.on("pending", async (txHash) => {
    try {
        const tx = await provider.getTransaction(txHash);
        
        if (tx && tx.from.toLowerCase() === MY_ADDRESS) {
            const msg = `🎯 **POLYMARKET HANDEL DETEKTERET!**\n\n` +
                        `Din wallet har lige udført en transaktion.\n\n` +
                        `Se detaljer her: https://polygonscan.com/tx/${txHash}`;
            
            bot.sendMessage(CHAT_ID, msg);
        }
    } catch (e) {
        // Ignorer midlertidige netværksfejl
    }
});

// Sikkerhedsnet: Lytter også på bekræftede blokke
provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber, true);
    for (const tx of block.transactions) {
        if (tx.from.toLowerCase() === MY_ADDRESS) {
            bot.sendMessage(CHAT_ID, `✅ **HANDEL BEKRÆFTET PÅ BLOCKCHAIN!**\n\nTX: https://polygonscan.com/tx/${tx.hash}`);
        }
    }
});

provider.on("error", (e) => console.log("WSS Fejl:", e));
