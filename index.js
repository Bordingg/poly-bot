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

console.log("Simpel Haj-Tracker kører...");
bot.sendMessage(CHAT_ID, "✅ **Botten er klar i det simple format!**\nOvervåger Humbleboy, Tak og Gd0.");

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

        // Det ultra-simple format du bad om:
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

provider.on("error", () => setTimeout(() => process.exit(1), 5000));
