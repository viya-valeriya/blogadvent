export default async function handler(req, res) {
  try {
    // Healthcheck
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, route: "/api/bot" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // например 910701170

    if (!BOT_TOKEN) {
      return res.status(500).json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN" });
    }

    const update = req.body || {};
    const message = update.message || update.edited_message;
    const callbackQuery = update.callback_query;

    // Telegram иногда шлёт callback_query (кнопки). Нам сейчас важнее /start.
    const chat = message?.chat || callbackQuery?.message?.chat;
    const chatId = chat?.id;

    // Всегда отвечаем 200, чтобы Telegram не ретраил бесконечно
    res.status(200).json({ ok: true });

    if (!chatId) return;

    const text =
      message?.text ||
      callbackQuery?.data ||
      "";

    const lower = String(text || "").trim().toLowerCase();

    const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}`;

    async function tgSend(chat_id, payload) {
      await fetch(`${telegramApi}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, ...payload }),
      });
    }

    // Команда /id — на всякий случай (пользователь сам видит свой chat_id)
    if (lower === "/id" || lower.startsWith("/id ")) {
      await tgSend(chatId, {
        text: `Твой chat_id: ${chatId}`,
      });
      return;
    }

    // /start
    if (lower === "/start" || lower.startsWith("/start")) {
      const username = chat?.username ? `@${chat.username}` : "(no username)";
      const firstName = chat?.first_name || "";
      const lastName = chat?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();

      // 1) Ответ пользователю
      await tgSend(chatId, {
        text:
          `Привет! ✨\n\n` +
          `Вот твой адвент: ${process.env.WEBAPP_URL || "https://viya-blogadvent.vercel.app"}\n\n` +
          `Если кнопка внизу — жми её. Если нет — просто открой ссылку.`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎄 Открыть адвент",
                url: process.env.WEBAPP_URL || "https://viya-blogadvent.vercel.app",
              },
            ],
          ],
        },
      });

      // 2) Сообщение админу (тебе) — чтобы собрать id без getUpdates
      if (ADMIN_CHAT_ID) {
        await tgSend(ADMIN_CHAT_ID, {
          text:
            `🧾 Новый /start\n` +
            `chat_id: ${chatId}\n` +
            `user: ${username}\n` +
            `name: ${fullName || "(no name)"}\n` +
            `date: ${new Date().toISOString()}`,
        });
      }

      return;
    }

    // Любое другое сообщение: тихо игнорируем (чтобы не спамить)
    return;
  } catch (err) {
    // Даже при ошибке лучше вернуть 200 (Telegram иначе будет долбить ретраями)
    try {
      return res.status(200).json({ ok: true });
    } catch (_) {
      return;
    }
  }
}
