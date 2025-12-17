import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

function ErrorScreen({ title, detail }) {
  return (
    <div style={{
      minHeight: "100vh",
      padding: 24,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      background: "#0b0b0b",
      color: "#f0f0f0"
    }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h1>
      <pre style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        background: "#151515",
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(212,175,55,0.25)",
        color: "#D4AF37"
      }}>
        {detail || "No details"}
      </pre>
      <p style={{ marginTop: 12, opacity: 0.7 }}>
        Если видишь это — React жив, но App падает. Скопируй текст ошибки сюда.
      </p>
    </div>
  );
}

class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("Boundary caught:", err, info);
  }
  render() {
    if (this.state.err) {
      return <ErrorScreen title="❌ Runtime error in App.jsx" detail={String(this.state.err?.stack || this.state.err)} />;
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");

// глобальные ошибки (если падает до React или вне него)
window.addEventListener("error", (e) => {
  console.error("window.error:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("unhandledrejection:", e.reason);
});

createRoot(rootEl).render(
  <React.StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </React.StrictMode>
);
