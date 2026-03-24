const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

// --- DINE UDVALGTE WALLETS ---
const WATCHLIST = {
    "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6": "Humbleboy",
    "0xce0871a82a7799ace36ab2fcd08f95b21cdf510b": "Tak",
    "0x26acaab03640f75d3f8b3050eee204af71eba735": "Gd0"
};

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

// Vi laver en liste over de rå adresser til filteret (små bogstaver for sikkerhed)
const addresses = Object.keys(WATCHLIST).map(addr => addr.toLowerCase());

console.log("Multi-overvågning starter for Humbleboy, Tak og Gd0...");

// Send opstartsbesked til Telegram
bot.sendMessage(CHAT_ID, `🚀 **Multi-Bot Online!**\n\nJeg overvåger nu:\n1. 🦈 **Humbleboy**\n2. 🐋 **Tak**\n3. 🐬 **Gd0**\n\n*Jeg sender besked så snart de rører på sig!*`, { parse_mode: 'Markdown' });

// Filter der lytter efter alle 3 adresser i blockchainens logs
const filter = {
    address: null, 
    topics: [
        null, 
        addresses.map(addr => ethers.zeroPadValue(addr, 32))
    ]
};

provider.on(filter, async (log) => {
    try {
        const txHash = log.transactionHash;
        
        // Find ud af hvilken wallet der handlede ved at matche loggen
        const foundAddress = addresses.find(addr => 
            log.topics.some(topic => topic.toLowerCase().includes(addr.replace("0x", "")))
        );

        const nickname = WATCHLIST[foundAddress] || "Ukendt Wallet";
        const receipt = await provider.getTransactionReceipt(txHash);

        // Find USDC beløb (6 decimaler)
        let amount = "Beregner...";
        const usdcLog = receipt.logs.find(l => l.address.toLowerCase() === "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359");
        if (usdcLog) {
            try {
                const rawAmount = ethers.toBigInt(usdcLog.data);
                amount = (Number(rawAmount) / 1000000).toFixed(2);
            } catch (err) { amount = "Variabel"; }
        }

        const message = `
🔔 **NY HANDEL DETEKTERET!**

👤 **Navn:** \`${nickname}\`
💰 **Indsats:** $${amount}
📍 **Wallet:** \`${foundAddress}\`

🔗 **Links:**
• [Se Profil på Polymarket](https://polymarket.com/profile/${foundAddress})
• [Se Transaktion på Polygonscan](https://polygonscan.com/tx/${txHash})
        `;

        bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

    } catch (e) {
        console.error("Fejl i log-behandling:", e);
    }
});

// Genstart ved netværksfejl
provider.on("error", (e) => {
    console.log("Forbindelse tabt - genstarter om 5 sekunder...");
    setTimeout(() => process.exit(1), 5000);
});
