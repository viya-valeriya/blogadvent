export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const WEBAPP_URL = process.env.WEBAPP_URL;

  if (!TOKEN || !WEBAPP_URL) {
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or WEBAPP_URL env vars" });
  }

  const update = req.body || {};
  const message = update.message || update.edited_message;
  const text = message?.text || "";
  const chatId = message?.chat?.id;

  // если это не сообщение — просто ок
  if (!chatId) return res.status(200).send("OK");

  // кнопка WebApp
  const keyboard = {
    inline_keyboard: [
      [{ text: "Открыть календарь", web_app: { url: WEBAPP_URL } }],
    ],
  };

  const sendMessage = async (payload) => {
    const resp = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return resp.json();
  };

  try {
    // /start или любой стартовый текст
    if (text.startsWith("/start")) {
      await sendMessage({
        chat_id: chatId,
        text: "Готово ✨ Жми кнопку ниже — откроется адвент.",
        reply_markup: keyboard,
      });
    } else {
      // на любые другие сообщения тоже даем кнопку (чтобы пользователь не потерялся)
      await sendMessage({
        chat_id: chatId,
        text: "Я тут 🙂 Открыть календарь?",
        reply_markup: keyboard,
      });
    }

    return res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Bot handler failed" });
  }
}
