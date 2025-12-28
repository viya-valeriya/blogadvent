const fetch = require("node-fetch");
const subscribers = require("./subscribers.json");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN env var");
  process.exit(1);
}

if (!Array.isArray(subscribers) || subscribers.length === 0) {
  console.error("No subscribers in scripts/notifications/subscribers.json");
  process.exit(1);
}

// Канонический URL календаря для ВСЕХ входов:
const CALENDAR_URL = "https://viya-blogadvent.vercel.app";

async function main() {
  const text =
    "Новый день блог-адвента уже открыт! 🎄\n\n" +
    `Открыть календарь: ${CALENDAR_URL}`;

  for (const chatId of subscribers) {
    console.log(`Sending to ${chatId}...`);

    try {
      const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });

      const body = await res.text();

      if (!res.ok) {
        console.error(`Error for ${chatId}:`, res.status, body);
      } else {
        console.log(`OK for ${chatId}:`, body);
      }
    } catch (err) {
      console.error(`Unexpected error for ${chatId}:`, err);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
