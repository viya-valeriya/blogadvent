const TOKEN = process.env.TG_BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function callTelegram(method, payload) {
  const url = `${TELEGRAM_API}/${method}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!data.ok) console.error('Telegram error:', data);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Bot is running');

  try {
    if (!TOKEN) return res.status(500).send('No TG_BOT_TOKEN');
    if (!WEBAPP_URL) return res.status(500).send('No WEBAPP_URL');

    const update = req.body;
    const message = update.message || update.edited_message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    if (!chatId) return res.status(200).send('no chat');

    if (text === '/start') {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: 'Открываем твой адвент ✨',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Открыть адвент 🎁', web_app: { url: WEBAPP_URL } }],
          ],
        },
      });
      return res.status(200).send('ok');
    }

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: 'Напиши /start, чтобы открыть адвент 🎁',
    });

    return res.status(200).send('ok');
  } catch (e) {
    console.error('Bot handler error:', e);
    return res.status(500).send('error');
  }
}

