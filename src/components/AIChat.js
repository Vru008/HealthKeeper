import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import "./aichat.css";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm your HealthKeeper assistant 🩺 Describe your symptoms or ask which kind of doctor to see, and I'll point you in the right direction.",
};

const AIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { messages: next });
      setMessages([...next, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            err.response?.data?.error ||
            "Sorry, I'm having trouble responding right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="ai-fab"
        aria-label="Open health assistant"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-header">
            <span className="ai-dot" />
            HealthKeeper Assistant
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai-assistant ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="ai-input" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms or specialities…"
            />
            <button type="submit" disabled={loading}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
