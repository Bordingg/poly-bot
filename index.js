const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Din adresse - vi sørger for den er med små bogstaver her
const TARGET = "0x39966e0093C920B2C935E517f1fA5b57A3d1b4f".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Starter fejlsikret overvågning...");

// Den mest simple måde at lytte på Transfer-events i ethers
// Dette svarer til: "Lyt efter alle transfers, hvor TARGET er modtager"
const filter = {
    address: null, // Vi lytter på alle kontrakter (USDC, Shares, osv.)
    topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        ethers.zeroPadValue(TARGET, 32)
    ]
};

bot.sendMessage(CHAT_ID, "✅ Botten er online og overvåger nu: " + TARGET);

provider.on(filter, (log) => {
    try {
        const txHash = log.transactionHash;
        bot.sendMessage(CHAT_ID, `🎯 **HANDEL FUNDET!**\n\nNoget er landet i din wallet.\nSe her: https://polygonscan.com/tx/${txHash}`);
    } catch (e) {
        console.error("Fejl ved afsendelse:", e);
    }
});

// Forhindrer crash hvis forbindelsen driller
provider.on("error", (e) => console.log("WSS Fejl:", e));
