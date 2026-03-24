const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

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

console.log("🚀 Haj-Tracker v2.0 er startet...");
bot.sendMessage(CHAT_ID, "✅ **Haj-Tracker v2.0 er LIVE!**\nJeg henter nu spil-titler og præcise beløb.");

// Funktion der spørger Polymarket API om den seneste handel
async function getTradeDetails(wallet) {
    try {
        // Vi henter historikken for brugeren fra Polymarkets Gamma API
        const response = await axios.get(`https://gamma-api.polymarket.com/history?user=${wallet}&limit=1`);
        if (response.data && response.data.length > 0) {
            const trade = response.data[0];
            return {
                title: trade.title || "Ukendt væddemål",
                amount: parseFloat(trade.usdSize).toFixed(2),
                side: trade.side === "BUY" ? "KØBT" : "SOLGT",
                outcome: trade.outcome || ""
            };
        }
    } catch (error) {
        console.error("API fejl:", error.message);
    }
    return null;
}

const filter = {
    address: null, 
    topics: [null, addresses.map(addr => ethers.zeroPadValue(addr, 32))]
};

provider.on(filter, async (log) => {
    try {
        const foundAddress = addresses.find(addr => 
            log.topics.some(topic => topic.toLowerCase().includes(addr.replace("0x", "")))
        );
        const nickname = WATCHLIST[foundAddress];

        // Vi venter 5 sekunder før vi spørger API'et, så deres database når at opdatere
        setTimeout(async () => {
            const details = await getTradeDetails(foundAddress);
            
            let message;
            if (details) {
                // Her er dit ønskede pæne format:
                message = `
💸 **SPIL FRA ${nickname.toUpperCase()}!**

🗳️ **Væddemål:** _${details.title}_
💵 **Beløb:** $${details.amount} (${details.side} ${details.outcome})

📈 [Åbn hans profil her](https://polymarket.com/profile/${foundAddress})
                `;
            } else {
                message = `
💸 **AKTIVITET FRA ${nickname.toUpperCase()}!**
_Handlen er registreret, men detaljer er ikke klar endnu._

📈 [Se profil her](https://polymarket.com/profile/${foundAddress})
                `;
            }

            bot.sendMessage(CHAT_ID, message, { 
                parse_mode: 'Markdown', 
                disable_web_page_preview: true 
            });
        }, 5000);

    } catch (e) {
        console.error("Fejl:", e);
    }
});

provider.on("error", () => setTimeout(() => process.exit(1), 5000));
