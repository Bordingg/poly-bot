const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const WATCHLIST = {
    "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6": "Humbleboy",
    "0xce0871a82a7799ace36ab2fcd08f95b21cdf510b": "Tak",
    "0x26acaab03640f75d3f8b3050eee204af71eba735": "Gd0"
};

// --- HUKOMMELSE TIL SPAM-FILTER ---
const lastSeenTrade = {}; 

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running and awake!');
}).listen(process.env.PORT || 8080);

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);
const addresses = Object.keys(WATCHLIST).map(addr => addr.toLowerCase());

console.log("🚀 Haj-Tracker 3.5 (Spam-filter) Online...");

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

        // --- SPAM-FILTER LOGIK ---
        // Hvis denne person har handlet inden for de sidste 5 sekunder, så stop her.
        if (lastSeenTrade[foundAddress] && (now - lastSeenTrade[foundAddress] < 5000)) {
            return; 
        }
        lastSeenTrade[foundAddress] = now; // Opdater sidst sete tidspunkt

        const message = `💸 **SPIL FRA ${nickname.toUpperCase()}!**\n\n📈 [Åbn hans profil her](https://polymarket.com/profile/${foundAddress})`;
        bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
        
    } catch (e) { console.error("Fejl:", e); }
});

setInterval(async () => {
    try {
        await provider.getBlockNumber();
        console.log("Ping: OK - " + new Date().toLocaleTimeString());
    } catch (e) {
        console.error("Forbindelse tabt, genstarter...");
        process.exit(1);
    }
}, 60000);

provider.on("error", () => setTimeout(() => process.exit(1), 5000));
