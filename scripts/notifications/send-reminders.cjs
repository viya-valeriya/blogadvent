const fetch = require("node-fetch");
const subscribers = require("./subscribers.json");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN env");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function main() {
  const text =
    "✨ Напоминание от адвент-календаря\n\n" +
    "Сегодня тебя ждёт новая мысль.\n\n" +
    "👉 Открыть календарь:\nhttps://viya-blogadvent.vercel.app";

  for (const chatId of subscribers) {
    try {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      console.log(`Sent to ${chatId}`);
    } catch (e) {
      console.error(`Failed for ${chatId}`, e);
    }
  }
}

main();
