const express = require("express");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const router = express.Router();

/* =========================
   Gemini client (Google AI) — FREE tier, no credit card needed.
   Key lives in server/.env as GEMINI_API_KEY and never reaches the browser.
========================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// flash-lite has a much higher FREE daily quota than gemini-2.5-flash (which is
// only ~20 requests/day on the free tier). Override with GEMINI_MODEL if needed.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const SPECIALITIES =
  "Cardiology, Neurology, Oncology, Orthopedics, Pediatrics, Dermatology, " +
  "Gynecology, Ophthalmology, ENT, Urology, Nephrology, Gastroenterology, " +
  "Pulmonology, Psychiatry, Dentistry, General Medicine";
const CITIES =
  "Ahmedabad, Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, " +
  "Jaipur, Surat, Lucknow, Chandigarh";

const DISCLAIMER =
  "This is general information, not a medical diagnosis. Always confirm with a " +
  "qualified doctor, and seek emergency care for severe or sudden symptoms.";

// Multilingual support — respond in the user's language when requested.
const LANGS = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  mr: "Marathi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
};
const langLine = (lang) =>
  lang && LANGS[lang] && lang !== "en"
    ? ` IMPORTANT: Write all human-readable text (summaries, advice, messages) entirely in ${LANGS[lang]}. Keep medical/speciality names recognizable.`
    : "";

function ensureKey(res) {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set in server/.env" });
    return false;
  }
  return true;
}

const parseJson = (result) => JSON.parse(result.response.text());

// Turn raw Gemini errors into clean, user-friendly responses.
function aiError(res, err) {
  const msg = err?.message || "AI request failed";
  console.log("ai error:", msg.split("\n")[0]);
  if (/429|quota|rate.?limit|too many requests/i.test(msg)) {
    return res.status(429).json({
      error:
        "The AI assistant is busy right now (free usage limit reached). Please try again in a minute.",
    });
  }
  return res.status(500).json({ error: msg });
}

// Fast, rule-based red-flag detector — a safety net independent of the model.
const EMERGENCY_PATTERNS = [
  /chest pain/i,
  /short(ness)? of breath|can.?t breathe|difficulty breathing|struggling to breathe/i,
  /(left )?arm.{0,12}(numb|tingl|pain)|numb.{0,12}arm/i,
  /slurred speech|face.{0,10}droop|one side.{0,15}(weak|numb)/i,
  /stroke|heart attack|cardiac arrest/i,
  /unconscious|passed out|fainted|unresponsive/i,
  /severe bleeding|bleeding heavily|won.?t stop bleeding/i,
  /suicid|kill myself|end my life|self.?harm/i,
  /seizure|convulsion|fitting/i,
  /choking|can.?t swallow/i,
  /anaphyla|severe allergic|throat.{0,10}swell/i,
  /coughing up blood|vomiting blood/i,
];
const isEmergency = (text) =>
  EMERGENCY_PATTERNS.some((re) => re.test(text || ""));

/* =========================
   1) HEALTH ASSISTANT CHAT (24/7)
   POST /api/ai/chat  { messages: [{ role, content }] }
========================= */
router.post("/chat", async (req, res) => {
  if (!ensureKey(res)) return;
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

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
        "and hospitals across India in these specialities: " +
        SPECIALITIES +
        ". When a user describes symptoms, clearly name the single most relevant " +
        "speciality from that list, briefly explain why, and tell them they can view and " +
        "book doctors in that speciality right here on HealthKeeper. Do NOT say you can't " +
        "provide a list — direct them to the matching speciality. Be concise and warm. " +
        DISCLAIMER + langLine(req.body.lang),
    });
    const result = await model.generateContent({ contents });
    return res.json({ reply: result.response.text() });
  } catch (err) {
    console.log("chat error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   2) SYMPTOM CHECKER (+ emergency detection)
   POST /api/ai/symptom-check  { symptoms }
========================= */
router.post("/symptom-check", async (req, res) => {
  if (!ensureKey(res)) return;
  const { symptoms } = req.body;
  if (!symptoms || !symptoms.trim()) {
    return res.status(400).json({ error: "Please describe your symptoms" });
  }
  const emergency = isEmergency(symptoms);

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "You are a careful medical triage assistant. From the user's symptoms, list 2-4 " +
        "possible (non-alarming) explanations, set an urgency level of exactly one of " +
        "'low', 'moderate', 'high', or 'emergency', choose the single most relevant " +
        "speciality from: " +
        SPECIALITIES +
        ", and give brief next-step advice. Never state a definitive diagnosis. " +
        DISCLAIMER + langLine(req.body.lang),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            possibleCauses: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            urgency: { type: SchemaType.STRING },
            speciality: { type: SchemaType.STRING },
            advice: { type: SchemaType.STRING },
          },
          required: ["possibleCauses", "urgency", "speciality", "advice"],
        },
      },
    });
    const data = parseJson(
      await model.generateContent(`Symptoms: ${symptoms}`)
    );
    if (emergency) data.urgency = "emergency";
    data.emergency = emergency || /emergency/i.test(data.urgency || "");
    data.disclaimer = DISCLAIMER;
    return res.json(data);
  } catch (err) {
    console.log("symptom-check error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   3) DOCTOR MATCHING — natural language → filters
   POST /api/ai/match-doctor  { query }
========================= */
router.post("/match-doctor", async (req, res) => {
  if (!ensureKey(res)) return;
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Please describe what you need" });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "Convert a patient's free-text request into doctor-search filters. " +
        "speciality: one of [" +
        SPECIALITIES +
        "] or empty string if unclear. gender: 'Male', 'Female', or 'any'. " +
        "city: one of [" +
        CITIES +
        "] or empty string. maxFee: consultation fee ceiling in rupees as an integer " +
        "(0 if not mentioned).",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            speciality: { type: SchemaType.STRING },
            gender: { type: SchemaType.STRING },
            city: { type: SchemaType.STRING },
            maxFee: { type: SchemaType.INTEGER },
          },
          required: ["speciality", "gender", "city", "maxFee"],
        },
      },
    });
    return res.json(parseJson(await model.generateContent(query)));
  } catch (err) {
    console.log("match-doctor error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   4) HOSPITAL RECOMMENDATION — natural language → filters
   POST /api/ai/recommend-hospital  { query }
========================= */
router.post("/recommend-hospital", async (req, res) => {
  if (!ensureKey(res)) return;
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Please describe what you need" });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "Convert a patient's request into hospital-search filters. " +
        "speciality: one of [" +
        SPECIALITIES +
        "] or empty. city: one of [" +
        CITIES +
        "] or empty. priceTier: 'Budget', 'Mid-range', 'Premium', or 'any'. " +
        "needsInsurance: true if they mention insurance/cashless, else false.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            speciality: { type: SchemaType.STRING },
            city: { type: SchemaType.STRING },
            priceTier: { type: SchemaType.STRING },
            needsInsurance: { type: SchemaType.BOOLEAN },
          },
          required: ["speciality", "city", "priceTier", "needsInsurance"],
        },
      },
    });
    return res.json(parseJson(await model.generateContent(query)));
  } catch (err) {
    console.log("recommend-hospital error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   5) MEDICAL REPORT READER (PDF / image / text)
   POST /api/ai/report  { text?, fileData? (base64), mimeType? }
========================= */
router.post("/report", async (req, res) => {
  if (!ensureKey(res)) return;
  const { text, fileData, mimeType } = req.body;
  if (!text && !fileData) {
    return res
      .status(400)
      .json({ error: "Paste your report text or upload a file" });
  }

  const parts = [];
  if (fileData && mimeType) {
    parts.push({ inlineData: { mimeType, data: fileData } });
    parts.push({ text: "The document above is the patient's medical report." });
  } else {
    parts.push({ text: `Medical report:\n${text}` });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "You explain medical reports (blood tests, X-rays, prescriptions) to patients in " +
        "simple, reassuring, plain language. Give a short summary, then key findings with " +
        "what each means in everyday terms, then gentle next-step advice. NEVER give a " +
        "definitive diagnosis or change/recommend specific medication doses; tell the " +
        "patient to confirm with their doctor. " +
        DISCLAIMER + langLine(req.body.lang),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            findings: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  label: { type: SchemaType.STRING },
                  meaning: { type: SchemaType.STRING },
                },
                required: ["label", "meaning"],
              },
            },
            advice: { type: SchemaType.STRING },
          },
          required: ["summary", "findings", "advice"],
        },
      },
    });
    const data = parseJson(await model.generateContent(parts));
    data.disclaimer = DISCLAIMER;
    return res.json(data);
  } catch (err) {
    console.log("report error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   6) FOLLOW-UP & CARE REMINDERS
   POST /api/ai/follow-up  { speciality?, condition?, datetime? }
========================= */
router.post("/follow-up", async (req, res) => {
  if (!ensureKey(res)) return;
  const { speciality, condition, datetime } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "Suggest sensible post-appointment follow-up care. Provide a follow-up interval " +
        "in days (integer), 3-5 short general reminders (e.g. rest, hydration, take " +
        "prescribed medicines as directed, warning signs to watch for), and a one-line " +
        "note. Do NOT prescribe specific drugs or doses. " +
        DISCLAIMER + langLine(req.body.lang),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            followUpInDays: { type: SchemaType.INTEGER },
            reminders: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            note: { type: SchemaType.STRING },
          },
          required: ["followUpInDays", "reminders", "note"],
        },
      },
    });
    const prompt = `Speciality: ${speciality || "general"}. Reason: ${
      condition || "routine visit"
    }. Appointment date: ${datetime || "recent"}.`;
    const data = parseJson(await model.generateContent(prompt));
    data.disclaimer = DISCLAIMER;
    return res.json(data);
  } catch (err) {
    console.log("follow-up error:", err.message);
    return aiError(res, err);
  }
});

/* =========================
   7) COST PREDICTION ENGINE
   POST /api/ai/cost-estimate  { query, city?, lang? }
========================= */
router.post("/cost-estimate", async (req, res) => {
  if (!ensureKey(res)) return;
  const { query, city } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Tell us the treatment or procedure" });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "You estimate typical healthcare costs in India in Indian Rupees. For the given " +
        "treatment/procedure, give rough cost RANGES for government, private, and premium " +
        "hospitals (e.g. '₹30,000 - ₹70,000'), list what the cost typically includes, name " +
        "the single most relevant speciality from [" +
        SPECIALITIES +
        "], and add a one-line note. These are rough estimates, not quotes. " +
        DISCLAIMER + langLine(req.body.lang),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            treatment: { type: SchemaType.STRING },
            speciality: { type: SchemaType.STRING },
            government: { type: SchemaType.STRING },
            private: { type: SchemaType.STRING },
            premium: { type: SchemaType.STRING },
            includes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            note: { type: SchemaType.STRING },
          },
          required: ["treatment", "speciality", "government", "private", "premium", "includes", "note"],
        },
      },
    });
    const data = parseJson(
      await model.generateContent(
        `Treatment/procedure: ${query}. City: ${city || "India"}.`
      )
    );
    data.disclaimer = DISCLAIMER;
    return res.json(data);
  } catch (err) {
    return aiError(res, err);
  }
});

/* =========================
   8) TREATMENT JOURNEY PLANNER
   POST /api/ai/journey  { condition, lang? }
========================= */
router.post("/journey", async (req, res) => {
  if (!ensureKey(res)) return;
  const { condition } = req.body;
  if (!condition || !condition.trim()) {
    return res.status(400).json({ error: "Describe the condition" });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction:
        "Create a clear treatment-journey roadmap for the condition: 4-7 ordered steps " +
        "(consultation, tests, treatment, follow-up), each with a short detail; an estimated " +
        "total duration; a rough total cost range in INR; and a one-line note. This is a " +
        "general roadmap, not a substitute for a doctor's plan. " +
        DISCLAIMER + langLine(req.body.lang),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            steps: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  step: { type: SchemaType.STRING },
                  detail: { type: SchemaType.STRING },
                },
                required: ["step", "detail"],
              },
            },
            duration: { type: SchemaType.STRING },
            costRange: { type: SchemaType.STRING },
            note: { type: SchemaType.STRING },
          },
          required: ["steps", "duration", "costRange", "note"],
        },
      },
    });
    const data = parseJson(
      await model.generateContent(`Condition: ${condition}.`)
    );
    data.disclaimer = DISCLAIMER;
    return res.json(data);
  } catch (err) {
    return aiError(res, err);
  }
});

module.exports = router;
