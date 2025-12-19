const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ Missing BOT_TOKEN env var");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const subscribersPath = path.join(__dirname, "subscribers.json");

function loadSubscribers() {
  if (!fs.existsSync(subscribersPath)) return new Set();
  try {
    return new Set(JSON.parse(fs.readFileSync(subscribersPath, "utf8")));
  } catch {
    return new Set();
  }
}

function saveSubscribers(set) {
  fs.writeFileSync(
    subscribersPath,
    JSON.stringify([...set].sort(), null, 2),
    "utf8"
  );
  console.log(`✅ Saved ${set.size} subscribers`);
}

async function main() {
  const subscribers = loadSubscribers();

  const res = await fetch(`${TELEGRAM_API}/getUpdates`);
  const data = await res.json();

  if (!data.ok) {
    console.error("❌ getUpdates failed", data);
    process.exit(1);
  }

  let added = 0;

  for (const u of data.result) {
    const chatId =
      u.message?.chat?.id ??
      u.my_chat_member?.chat?.id;

    if (chatId && !subscribers.has(chatId)) {
      subscribers.add(chatId);
      added++;
    }
  }

  saveSubscribers(subscribers);
  console.log(`➕ Added ${added} new subscribers`);
}

main().catch(console.error);
