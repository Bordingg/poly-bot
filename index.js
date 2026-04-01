const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const WATCHLIST = {
    "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6": "Humbleboy",
    "0xce0871a82a7799ace36ab2fcd08f95b21cdf510b": "Tak",
    "0x26acaab03640f75d3f8b3050eee204af71eba735": "Gd0",
    "0xd6e6120c3538399e82c00ce3f02ad8c1a0fe2915": "Stingo"
};

const lastSeenTrade = {}; 

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is awake!');
}).listen(process.env.PORT || 8080);

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);
const addresses = Object.keys(WATCHLIST).map(addr => addr.toLowerCase());

console.log("🚀 Haj-Tracker 3.7 (SOS-Mode) Online...");

// Velkomstbesked så du ved den er kørende efter et "sleep"
bot.sendMessage(CHAT_ID, "✅ **Tracker er genstartet og aktiv!**");

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
        const now = Date.now();

        if (lastSeenTrade[foundAddress] && (now - lastSeenTrade[foundAddress] < 5000)) return; 
        lastSeenTrade[foundAddress] = now;

        const message = `💸 **SPIL FRA ${nickname.toUpperCase()}!**\n\n📈 [Åbn hans profil her](https://polymarket.com/profile/${foundAddress})`;
        bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (e) { console.error("Fejl:", e); }
});

// Forbedret Keep-alive med SOS-besked
setInterval(async () => {
    try {
        await provider.getBlockNumber();
        console.log("Ping: OK - " + new Date().toLocaleTimeString());
    } catch (e) {
        console.error("Forbindelse tabt! Sender SOS...");
        // Vi prøver at sende en besked før vi dør
        await bot.sendMessage(CHAT_ID, "⚠️ **ADVARSEL:** Forbindelsen til Polygon er tabt. Jeg genstarter mig selv nu for at prøve at vågne...");
        process.exit(1);
    }
}, 60000);

// Hvis selve WebSocket-forbindelsen dør
provider.on("error", async (e) => {
    console.error("Provider fejl:", e);
    await bot.sendMessage(CHAT_ID, "🚨 **NETVÆRKSFEJL:** Jeg har mistet forbindelsen til Alchemy/Polygon og genstarter...");
    setTimeout(() => process.exit(1), 2000);
});
