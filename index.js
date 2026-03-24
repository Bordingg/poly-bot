const ethers = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.POLYGON_RPC_URL;

const TARGET_ADDRESS = "0x4b59e178095b9bb5ba97598244f2ca8b02fc3aa6".toLowerCase();

const bot = new TelegramBot(TOKEN);
const provider = new ethers.WebSocketProvider(RPC_URL);

console.log("Præcisions-overvågning kører...");

const filter = {
    address: null, 
    topics: [null, ethers.zeroPadValue(TARGET_ADDRESS, 32)]
};

provider.on(filter, async (log) => {
    try {
        const txHash = log.transactionHash;
        
        // Vi henter transaktionen for at se detaljer
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);

        // Forsøg på at finde beløbet (USDC har 6 decimaler)
        // Vi kigger efter Transfer-events i samme transaktion
        let amount = "Ukendt";
        const usdcLog = receipt.logs.find(l => l.address.toLowerCase() === "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359");
        if (usdcLog) {
            const rawAmount = ethers.toBigInt(usdcLog.data);
            amount = (Number(rawAmount) / 1000000).toFixed(2);
        }

        const message = `
🎯 **DER ER SPIL!**

👤 **Bruger:** \`${TARGET_ADDRESS}\`
💰 **Anslået beløb:** $${amount}

🔗 **Links:**
• [Se handlen på Polygonscan](https://polygonscan.com/tx/${txHash})
• [Se hans profil på Polymarket](https://polymarket.com/profile/${TARGET_ADDRESS})

*Botten overvåger stadig live...*
        `;

        bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: false });

    } catch (e) {
        console.error("Fejl i besked-generering:", e);
    }
});

provider.on("error", (e) => {
    console.log("Netværksfejl - genstarter...");
    setTimeout(() => process.exit(1), 5000);
});
