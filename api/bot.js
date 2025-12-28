export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, route: "/api/bot" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    const WEBAPP_URL = process.env.WEBAPP_URL || "https://viya-blogadvent.vercel.app";

    if (!BOT_TOKEN) {
      return res.status(500).json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN" });
    }

    const update = req.body || {};
    const message = update.message || update.edited_message;
    const callbackQuery = update.callback_query;

    const chat = message?.chat || callbackQuery?.message?.chat;
    const chatId = chat?.id;

    // Быстро отвечаем Telegram'у, чтобы не держать соединение
    res.status(200).json({ ok: true });

    if (!chatId) return;

    const text = message?.text || callbackQuery?.data || "";
    const lower = String(text || "").trim().toLowerCase();

    const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}`;

    async function tgSend(chat_id, payload) {
      await fetch(`${telegramApi}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, ...payload }),
      });
    }

    // Авто-добавление chat_id в scripts/notifications/subscribers.json через GitHub API
    async function upsertSubscriberInGithub(chatIdToAdd) {
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO; // "viya-valeriya/blogadvent"
      const branch = process.env.GITHUB_BRANCH || "main";
      const filePath = "scripts/notifications/subscribers.json";

      if (!token || !repo) return { ok: false, reason: "missing_github_env" };

      const apiBase = "https://api.github.com";
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      for (let attempt = 1; attempt <= 5; attempt++) {
        // 1) читаем текущий файл
        const getUrl = `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`;
        const getRes = await fetch(getUrl, { headers });
        let sha = null;
        let arr = [];

        if (getRes.status === 200) {
          const data = await getRes.json();
          sha = data.sha;
          const content = Buffer.from(data.content || "", "base64").toString("utf8").trim();
          try {
            arr = JSON.parse(content || "[]");
            if (!Array.isArray(arr)) arr = [];
          } catch {
            arr = [];
          }
        } else if (getRes.status === 404) {
          arr = [];
          sha = null;
        } else {
          const t = await getRes.text();
          return { ok: false, reason: `get_failed_${getRes.status}`, details: t.slice(0, 200) };
        }

        const set = new Set(arr.map(Number).filter(Boolean));
        const before = set.size;
        set.add(Number(chatIdToAdd));
        const after = set.size;

        const next = Array.from(set).sort((a, b) => a - b);
        const nextText = JSON.stringify(next, null, 2) + "\n";
        const nextB64 = Buffer.from(nextText, "utf8").toString("base64");

        const putUrl = `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}`;
        const body = {
          message: `Add subscriber ${chatIdToAdd}`,
          content: nextB64,
          branch,
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(putUrl, {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (putRes.status === 200 || putRes.status === 201) {
          return { ok: true, added: after > before, total: after };
        }

        const putText = await putRes.text();
        if (putRes.status === 409 || putRes.status === 422) {
          // конфликт SHA — пробуем ещё раз
          continue;
        }
        return { ok: false, reason: `put_failed_${putRes.status}`, details: putText.slice(0, 300) };
      }

      return { ok: false, reason: "retry_exhausted" };
    }

    // /id — показать chat_id
    if (lower === "/id" || lower.startsWith("/id ")) {
      await tgSend(chatId, { text: `Твой chat_id: ${chatId}` });
      return;
    }

    // /start — подписываем + даём короткий текст и кнопку
    if (lower === "/start" || lower.startsWith("/start")) {
      const ghResult = await upsertSubscriberInGithub(chatId);

      await tgSend(chatId, {
        text: "✨ Нажми кнопку, чтобы открыть календарь.",
        reply_markup: {
          inline_keyboard: [[{ text: "Открыть календарь", url: WEBAPP_URL }]],
        },
      });

      if (ADMIN_CHAT_ID) {
        await tgSend(ADMIN_CHAT_ID, {
          text:
            `🧾 /start\n` +
            `chat_id: ${chatId}\n` +
            `github_sync: ${ghResult.ok ? "ok" : "fail"} ${ghResult.reason || ""}\n` +
            `date: ${new Date().toISOString()}`,
        });
      }
      return;
    }

    return;
  } catch (err) {
    try { return res.status(200).json({ ok: true }); } catch { return; }
  }
}
