const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN env var");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const subscribersPath = path.join(__dirname, "subscribers.json");

function loadSubscribers() {
  if (!fs.existsSync(subscribersPath)) {
    console.log("subscribers.json not found, creating new one");
    return new Set();
  }
  const raw = fs.readFileSync(subscribersPath, "utf8");
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("Not an array");
    return new Set(arr.map(Number));
  } catch (e) {
    console.error("Failed to parse subscribers.json:", e);
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
  console.log(`Saved ${arr.length} subscribers to scripts/subscribers.json`);
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
  const unsubscribed = new Set();

  for (const update of data.result) {
    // Личные сообщения
    if (
      update.message &&
      update.message.chat &&
      update.message.chat.type === "private"
    ) {
      newIds.add(update.message.chat.id);
    }

    // Изменение статуса бота в чате (подписка / блокировка)
    if (
      update.my_chat_member &&
      update.my_chat_member.chat &&
      update.my_chat_member.chat.type === "private"
    ) {
      const chatId = update.my_chat_member.chat.id;
      const status = update.my_chat_member.new_chat_member.status;

      if (status === "member") {
        newIds.add(chatId);
      }

      if (status === "kicked" || status === "left") {
        unsubscribed.add(chatId);
      }
    }
  }

  console.log(`Found ${newIds.size} ids from updates.`);
  console.log(`Found ${unsubscribed.size} unsubscribed ids.`);

  // Добавляем всех новых
  for (const id of newIds) {
    existing.add(id);
  }

  // Убираем тех, кто отписался/заблокировал бота
  for (const id of unsubscribed) {
    if (existing.has(id)) {
      existing.delete(id);
      console.log(`Removed unsubscribed id: ${id}`);
    }
  }

  saveSubscribers(existing);

  console.log("Done. Now run git add/commit/push to persist changes.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
