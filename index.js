const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const WATCHLIST = {
    "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6": "Humbleboy",
    "0xce0871a82a7799ace36ab2fcd08f95b21cdf510b": "Tak",
    "0x26acaab03640f75d3f8b3050eee204af71eba735": "Gd0"
};

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);
const addresses = Object.keys(WATCHLIST).map(addr => addr.toLowerCase());

console.log("🚀 Genstarter Haj-Tracker med Keep-Alive...");

// Send besked så du ved den er vågnet
bot.sendMessage(CHAT_ID, "☀️ **Botten er vågnet og overvåger igen!**");

const filter = {
    address: null, 
    topics: [null, addresses.map(addr => ethers.zeroPadValue(addr, 32))]
};

provider.on(filter, (log) => {
    try {
        const foundAddress = addresses.find(addr => 
            log.topics.some(topic => topic.toLowerCase().includes(addr.replace("0x", "")))
        );
        const nickname = WATCHLIST[foundAddress];

        const message = `
💸 **SPIL FRA ${nickname.toUpperCase()}!**

📈 [Åbn hans profil her](https://polymarket.com/profile/${foundAddress})
        `;

        bot.sendMessage(CHAT_ID, message, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
        });
    } catch (e) {
        console.error("Fejl:", e);
    }
});

// --- KEEP-ALIVE LOGIK ---
// Vi spørger om blocknummeret hvert 30. sekund for at holde forbindelsen varm
setInterval(async () => {
    try {
        await provider.getBlockNumber();
        console.log("Ping: Forbindelse er aktiv");
    } catch (e) {
        console.error("Forbindelse tabt i ping, genstarter...");
        process.exit(1);
    }
}, 30000);

provider.on("error", (e) => {
    console.error("Provider fejl:", e);
    setTimeout(() => process.exit(1), 5000);
});
