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

// Funktion til at hente detaljer med "Retry" (forsøger op til 3 gange)
async function fetchWithRetry(wallet, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(`https://gamma-api.polymarket.com/history?user=${wallet}&limit=1`);
            if (response.data && response.data.length > 0) {
                const trade = response.data[0];
                // Tjek om handlen er helt ny (inden for de sidste 2 minutter)
                return trade;
            }
        } catch (e) {
            console.log(`Forsøg ${i+1} fejlede...`);
        }
        // Vent 5 sekunder mere før næste forsøg
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    return null;
}

const filter = {
    address: null, 
    topics: [null, addresses.map(addr => ethers.zeroPadValue(addr, 32))]
};

provider.on(filter, async (log) => {
    try {
        const txHash = log.transactionHash;
        const foundAddress = addresses.find(addr => 
            log.topics.some(topic => topic.toLowerCase().includes(addr.replace("0x", "")))
        );
        const nickname = WATCHLIST[foundAddress];

        // Start detektiven
        const trade = await fetchWithRetry(foundAddress);
        
        let message;
        if (trade) {
            const side = trade.side === "BUY" ? "KØBT" : "SOLGT";
            const amount = parseFloat(trade.usdSize).toFixed(2);
            
            message = `
💸 **SPIL FRA ${nickname.toUpperCase()}!**

🗳️ **Væddemål:** _${trade.title}_
💵 **Beløb:** $${amount} (${side} ${trade.outcome})

📈 [Åbn hans profil her](https://polymarket.com/profile/${foundAddress})
🔗 [Se transaktion](https://polygonscan.com/tx/${txHash})
            `;
        } else {
            // Hvis alt fejler, giv i det mindste linket med det samme
            message = `
⚠️ **NY AKTIVITET FRA ${nickname.toUpperCase()}**
_Kunne ikke hente spildetaljer automatisk efter 15 sekunder._

📈 [Tjek profilen manuelt her](https://polymarket.com/profile/${foundAddress})
            `;
        }

        bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: true });

    } catch (e) {
        console.error("Fejl:", e);
    }
});

provider.on("error", () => setTimeout(() => process.exit(1), 5000));
