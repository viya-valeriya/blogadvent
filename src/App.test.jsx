import React, { useMemo, useState } from "react";

export default function App() {
  const [day, setDay] = useState(1);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Blog Advent (новый проект)</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Это проверка, что Vite/React в blogadvent работают без Firebase/Vercel.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginTop: 18 }}>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            style={{
              padding: "14px 0",
              borderRadius: 12,
              border: d === day ? "2px solid #111" : "1px solid #ddd",
              background: d === day ? "#111" : "#fff",
              color: d === day ? "#fff" : "#111",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 16, borderRadius: 12, border: "1px solid #eee" }}>
        <b>День {day}</b>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          Тут позже будет твой новый контент/логика/интеграции.
        </div>
      </div>
    </div>
  );
}
