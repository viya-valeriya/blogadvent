export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, route: "/api/bot" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const WEBAPP_URL = process.env.WEBAPP_URL || "https://viya-blogadvent.vercel.app";

    if (!BOT_TOKEN) {
      return res.status(500).json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN" });
    }

    const update = req.body || {};
    const message = update.message || update.edited_message || update.callback_query?.message;
    const chatId = message?.chat?.id;
    const text = (message?.text || update.callback_query?.data || "").trim().toLowerCase();

    // Быстро отвечаем Telegram'у, чтобы не ждать сетевых запросов
    res.status(200).json({ ok: true });

    if (!chatId) return;
    if (!text.startsWith("/start")) return;

    const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Отправляем сообщение с кнопкой "Открыть календарь"
    await fetch(`${telegramApi}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✨ Нажми кнопку, чтобы открыть календарь.",
        reply_markup: {
          inline_keyboard: [[{ text: "Открыть календарь", url: WEBAPP_URL }]],
        },
      }),
    });

    return;
  } catch (err) {
    try { return res.status(200).json({ ok: true }); } catch { return; }
  }
}
