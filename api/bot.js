export default async function handler(req, res) {
  // Telegram всегда шлёт POST. На GET отвечаем 200, чтобы удобно пинговать.
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const WEBAPP_URL = process.env.WEBAPP_URL;

  if (!BOT_TOKEN) {
    console.error("Missing TELEGRAM_BOT_TOKEN env");
    return res.status(500).send("Missing TELEGRAM_BOT_TOKEN");
  }
  if (!WEBAPP_URL) {
    console.error("Missing WEBAPP_URL env");
    return res.status(500).send("Missing WEBAPP_URL");
  }

  try {
    const update = req.body || {};
    const message = update.message;

    // Обрабатываем только обычные сообщения (нам достаточно /start)
    if (!message || !message.chat || !message.text) {
      return res.status(200).send("ok");
    }

    const chatId = message.chat.id;
    const text = String(message.text).trim();

    if (text === "/start" || text.startsWith("/start")) {
      const payload = {
        chat_id: chatId,
        text: "Готово ✨ Нажми кнопку, чтобы открыть календарь.",
        reply_markup: {
          keyboard: [[{ text: "Открыть календарь", web_app: { url: WEBAPP_URL } }]],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      };

      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const tgJson = await tgRes.json();
      if (!tgJson.ok) {
        console.error("Telegram sendMessage failed:", tgJson);
      }
    }

    return res.status(200).send("ok");
  } catch (e) {
    console.error("bot handler error:", e);
    return res.status(200).send("ok");
  }
}
