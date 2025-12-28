const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN env var");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const subscribersPath = path.join(__dirname, "blog-subscribers.json");

function loadSubscribers() {
  if (!fs.existsSync(subscribersPath)) {
    console.log("blog-subscribers.json not found, creating new one");
    return new Set();
  }
  const raw = fs.readFileSync(subscribersPath, "utf8");
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("Not an array");
    return new Set(arr.map(Number));
  } catch (e) {
    console.error("Failed to parse blog-subscribers.json:", e);
    process.exit(1);
  }
}

function saveSubscribers(set) {
  const arr = [...set].sort((a, b) => a - b);
  fs.writeFileSync(
    subscribersPath,
    JSON.stringify(arr, null, 2),
    "utf8"
  );
  console.log(`Saved ${arr.length} subscribers to blog-subscribers.json`);
}

async function main() {
  const existing = loadSubscribers();

  console.log(`Existing subscribers: ${existing.size}`);

  const res = await fetch(`${TELEGRAM_API}/getUpdates`);
  const data = await res.json();

  if (!data.ok || !Array.isArray(data.result)) {
    console.error("Bad getUpdates response:", data);
    process.exit(1);
  }

  if (data.result.length === 0) {
    console.log("No new updates from Telegram.");
    return;
  }

  const newIds = new Set();

  for (const update of data.result) {
    // Личные сообщения (message.chat.id)
    if (
      update.message &&
      update.message.chat &&
      update.message.chat.type === "private"
    ) {
      newIds.add(update.message.chat.id);
    }
  }

  console.log(`Found ${newIds.size} chat ids from messages.`);

  // ТОЛЬКО добавляем новых, никого не удаляем
  for (const id of newIds) {
    existing.add(id);
  }

  saveSubscribers(existing);

  console.log("Done. Now run git add/commit/push to persist changes if needed.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
