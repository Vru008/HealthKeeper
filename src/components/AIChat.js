import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { specialities, locations } from "../data/lists";
import "./aichat.css";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm your HealthKeeper assistant 🩺 Describe your symptoms or ask which kind of doctor to see, and I'll point you to the right specialists you can book here.",
};

// Map everyday words to a speciality in our catalog.
const SYNONYMS = {
  Cardiology: ["cardio", "heart", "cardiac", "chest pain", "palpitation"],
  Neurology: ["neuro", "brain", "nerve", "stroke", "migraine", "seizure", "headache"],
  Oncology: ["onco", "cancer", "tumor", "tumour", "chemo"],
  Orthopedics: ["ortho", "bone", "joint", "knee", "spine", "fracture", "back pain"],
  Pediatrics: ["pediatric", "paediatric", "child", "kid", "infant", "baby"],
  Dermatology: ["derma", "skin", "acne", "hair", "rash", "pimple"],
  Gynecology: ["gyno", "gynae", "women", "pregnan", "menstru", "pcos", "period"],
  Ophthalmology: ["ophthal", "eye", "vision", "cataract", "retina", "sight"],
  ENT: ["ear", "nose", "throat", "otolaryng", "sinus", "hearing", "tonsil"],
  Urology: ["urolog", "urine", "prostate", "bladder", "kidney stone"],
  Nephrology: ["nephro", "kidney", "renal", "dialysis"],
  Gastroenterology: ["gastro", "stomach", "digest", "liver", "intestine", "acidity"],
  Pulmonology: ["pulmo", "lung", "breath", "asthma", "copd", "respiratory", "cough"],
  Psychiatry: ["psych", "mental", "depress", "anxiety", "stress", "panic"],
  Dentistry: ["dental", "teeth", "tooth", "gum", "cavity"],
  "General Medicine": ["general medicine", "physician", "fever", "diabetes", "thyroid"],
};

const detectSpeciality = (text) => {
  const t = (text || "").toLowerCase();
  for (const s of specialities) if (t.includes(s.toLowerCase())) return s;
  for (const [s, words] of Object.entries(SYNONYMS))
    if (words.some((w) => t.includes(w))) return s;
  return null;
};

const detectCity = (text) => {
  const t = (text || "").toLowerCase();
  for (const c of locations) if (t.includes(c.toLowerCase())) return c;
  return "";
};

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { doctors } = useCatalog();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  // AI assistant is a logged-in perk — hide it from guests.
  if (!user) return null;

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
      const content =
        err.response?.data?.error ||
        (err.request
          ? "Can't reach the server. Make sure the backend is running (npm run dev) on port 5000."
          : err.message) ||
        "Sorry, I'm having trouble responding right now.";
      setMessages([...next, { role: "assistant", content }]);
    } finally {
      setLoading(false);
    }
  };

  const goToResults = (speciality, city) => {
    setOpen(false);
    navigate("/list", { state: { loc: city, speciality } });
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
            {messages.map((m, i) => {
              // For assistant replies, detect a speciality from the question + answer.
              const spec =
                m.role === "assistant" && i > 0
                  ? detectSpeciality(`${messages[i - 1]?.content} ${m.content}`)
                  : null;
              const city = spec
                ? detectCity(`${messages[i - 1]?.content} ${m.content}`)
                : "";
              const count = spec
                ? doctors.filter(
                    (d) =>
                      d.speciality === spec && (!city || d.location === city)
                  ).length
                : 0;

              return (
                <div key={i} className="ai-row">
                  <div className={`ai-msg ai-${m.role}`}>{m.content}</div>
                  {spec && count > 0 && (
                    <button
                      className="ai-action"
                      onClick={() => goToResults(spec, city)}
                    >
                      🔍 See {count} {spec} doctors{city ? ` in ${city}` : ""}
                    </button>
                  )}
                </div>
              );
            })}
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
