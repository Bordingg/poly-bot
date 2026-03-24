const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// ADRESSEN DU VIL OVERVÅGE
const TARGET_ADDRESS = "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Overvågning startet på target...");
bot.sendMessage(CHAT_ID, "👀 Jeg holder nu skarpt øje med: " + TARGET_ADDRESS);

// Vi bruger et filter, der lytter på ALT hvor hans adresse optræder
// Dette fanger både direkte overførsler og komplekse Polymarket-trades
const filter = {
    address: null, 
    topics: [
        null, // Vi er ligeglade med hvilken funktion (Transfer, Trade osv.)
        ethers.zeroPadValue(TARGET_ADDRESS, 32) // Lytter efter hans adresse i logs
    ]
};

provider.on(filter, (log) => {
    try {
        const txHash = log.transactionHash;
        bot.sendMessage(CHAT_ID, `🚨 **NY HANDEL FUNDET!**\n\nBrugeren har lige foretaget en aktion på Polymarket.\n\nSe handlen her: https://polygonscan.com/tx/${txHash}`);
    } catch (e) {
        console.error("Fejl ved afsendelse:", e);
    }
});

// Fejlhåndtering så den ikke crasher hvis nettet driller
provider.on("error", (e) => {
    console.log("WSS Netværksfejl, genstarter om 5 sek...");
    setTimeout(() => process.exit(1), 5000); // Railway genstarter den automatisk
});
