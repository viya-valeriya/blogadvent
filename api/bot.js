/**
 * Telegram Bot webhook handler for Vercel
 * - Reply to /start with a WebApp button that opens your Vite app
 *
 * Required env vars on Vercel:
 * - BOT_TOKEN   (from BotFather)
 * - WEBAPP_URL  (your deployed Vercel URL, e.g. https://....vercel.app)
 */

export const config = {
  api: { bodyParser: true },
};

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function tg(method, payload) {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN env var is missing");

  const url = `https://api.telegram.org/bot${token}/${method}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.ok === false) {
    const errText = data?.description ? `${data.description}` : `HTTP ${r.status}`;
    throw new Error(`Telegram API error: ${errText}`);
  }
  return data;
}

function normalizeWebAppUrl(url) {
  if (!url) return "";
  return url.replace(/\/+$/, ""); // remove trailing slashes
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      // Telegram sends POST updates. For GET we just show healthcheck.
      return sendJson(res, 200, { ok: true, message: "Use POST for Telegram webhook" });
    }

    const update = req.body || {};
    const message = update.message;
    const callbackQuery = update.callback_query;

    const webAppUrl = normalizeWebAppUrl(process.env.WEBAPP_URL);
    if (!webAppUrl) throw new Error("WEBAPP_URL env var is missing");

    // Handle callback_query (if you later add inline buttons)
    if (callbackQuery?.message?.chat?.id) {
      const chatId = callbackQuery.message.chat.id;

      await tg("answerCallbackQuery", {
        callback_query_id: callbackQuery.id,
      });

      await tg("sendMessage", {
        chat_id: chatId,
        text: "Открывай календарь 👇",
        reply_markup: {
          keyboard: [[{ text: "Открыть календарь", web_app: { url: webAppUrl } }]],
          resize_keyboard: true,
        },
      });

      return sendJson(res, 200, { ok: true });
    }

    // Handle regular message
    if (!message?.chat?.id) {
      return sendJson(res, 200, { ok: true, ignored: true });
    }

    const chatId = message.chat.id;
    const text = (message.text || "").trim();

    if (text === "/start" || text.startsWith("/start ")) {
      await tg("sendMessage", {
        chat_id: chatId,
        text: "Привет! Я принёс тебе адвент ✨\nНажми кнопку ниже, чтобы открыть календарь.",
        reply_markup: {
          keyboard: [[{ text: "Открыть календарь", web_app: { url: webAppUrl } }]],
          resize_keyboard: true,
        },
      });

      return sendJson(res, 200, { ok: true });
    }

    // Default fallback
    await tg("sendMessage", {
      chat_id: chatId,
      text: "Напиши /start — пришлю кнопку календаря 🎁",
    });

    return sendJson(res, 200, { ok: true });
  } catch (e) {
    // Important: always return 200 to Telegram to avoid retry storms
    console.error("Webhook error:", e);
    return sendJson(res, 200, { ok: false, error: String(e?.message || e) });
  }
}
