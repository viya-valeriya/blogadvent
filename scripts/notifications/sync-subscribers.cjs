/**
 * Sync Telegram subscribers while webhook is active:
 * - saves current webhook url
 * - deleteWebhook (so getUpdates works)
 * - reads updates and extracts chat_ids
 * - merges into scripts/notifications/subscribers.json
 * - restores webhook url
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN="xxx" node scripts/notifications/sync-subscribers.cjs
 */

const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN (or BOT_TOKEN) env var");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const subsPath = path.join(__dirname, "subscribers.json");

function loadSubscribers() {
  if (!fs.existsSync(subsPath)) return new Set();
  try {
    const arr = JSON.parse(fs.readFileSync(subsPath, "utf8"));
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((x) => Number(x)).filter(Boolean));
  } catch {
    return new Set();
  }
}

function saveSubscribers(set) {
  const arr = Array.from(set).sort((a, b) => a - b);
  fs.writeFileSync(subsPath, JSON.stringify(arr, null, 2) + "\n", "utf8");
  return arr.length;
}

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) {
    throw new Error(`${method} failed: ${data.error_code} ${data.description || ""}`);
  }
  return data.result;
}

function extractChatIds(updates) {
  const ids = new Set();

  for (const u of updates) {
    // message / edited_message
    const msg = u.message || u.edited_message;
    if (msg?.chat?.id && msg.chat.type === "private") ids.add(Number(msg.chat.id));

    // callback_query
    const cq = u.callback_query;
    if (cq?.message?.chat?.id && cq.message.chat.type === "private") ids.add(Number(cq.message.chat.id));

    // my_chat_member (when user blocks/unblocks bot etc.)
    const mcm = u.my_chat_member;
    if (mcm?.chat?.id && mcm.chat.type === "private") ids.add(Number(mcm.chat.id));
  }

  return ids;
}

async function main() {
  const existing = loadSubscribers();
  console.log(`📦 Existing subscribers: ${existing.size}`);

  const webhookInfo = await tg("getWebhookInfo");
  const currentUrl = webhookInfo.url || "";
  console.log(`🔗 Current webhook: ${currentUrl || "(empty)"}`);

  // 1) delete webhook so getUpdates works; keep pending updates
  await tg("deleteWebhook", { drop_pending_updates: false });
  console.log("🧹 Webhook deleted temporarily (drop_pending_updates=false)");

  // 2) pull updates in pages
  let offset = 0;
  let totalFetched = 0;
  let totalNewIds = 0;

  for (let i = 0; i < 50; i++) { // safety cap
    const updates = await tg("getUpdates", { offset, limit: 100, timeout: 0 });
    if (!updates || updates.length === 0) break;

    totalFetched += updates.length;

    const ids = extractChatIds(updates);
    for (const id of ids) {
      if (!existing.has(id)) {
        existing.add(id);
        totalNewIds++;
      }
    }

    // move offset
    offset = updates[updates.length - 1].update_id + 1;
  }

  const savedCount = saveSubscribers(existing);
  console.log(`✅ Updates fetched: ${totalFetched}`);
  console.log(`✅ New chat_ids added: ${totalNewIds}`);
  console.log(`✅ subscribers.json now: ${savedCount} ids`);

  // 3) restore webhook
  if (currentUrl) {
    await tg("setWebhook", { url: currentUrl });
    console.log("🔁 Webhook restored");
  } else {
    console.log("⚠️ Webhook was empty before — not restoring");
  }
}

main().catch((e) => {
  console.error("❌ Fatal:", e.message || e);
  process.exit(1);
});
