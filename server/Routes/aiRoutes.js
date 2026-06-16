const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

/* =========================
   Gemini client (Google AI) — FREE tier, no credit card needed.
   Get a key at https://aistudio.google.com/  → "Get API key"
   Put it in server/.env as GEMINI_API_KEY=...
   The key stays on the server and never reaches the browser.
========================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL = "gemini-2.5-flash";

function ensureKey(res) {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set in server/.env" });
    return false;
  }
  return true;
}

/* =========================
   HEALTH ASSISTANT CHATBOT
   POST /api/ai/chat  { messages: [{ role, content }] }
========================= */
router.post("/chat", async (req, res) => {
  if (!ensureKey(res)) return;

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Gemini uses roles "user" and "model". Map and cap history.
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content) }],
    }));

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "You are HealthKeeper's health assistant. HealthKeeper lists verified doctors " +
        "and hospitals across India in these specialities: Cardiology, Neurology, " +
        "Oncology, Orthopedics, Pediatrics, Dermatology, Gynecology, Ophthalmology, ENT, " +
        "Urology, Nephrology, Gastroenterology, Pulmonology, Psychiatry, Dentistry, " +
        "General Medicine. When a user describes symptoms, clearly name the single most " +
        "relevant speciality from that list, briefly explain why, and tell them they can " +
        "view and book doctors in that speciality right here on HealthKeeper. Do NOT say " +
        "you can't provide a list — instead direct them to the matching speciality. Be " +
        "concise and warm, using short paragraphs or bullet points. Always remind users " +
        "this is general information, not a diagnosis, and to seek emergency care for " +
        "severe symptoms.",
    });

    const result = await model.generateContent({ contents });
    return res.json({ reply: result.response.text() });
  } catch (err) {
    console.log("chat error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
