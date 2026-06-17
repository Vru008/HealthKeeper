import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { specialities, locations } from "../../data/lists";
import { useCatalog } from "../../context/CatalogContext";
import { downloadICS, googleCalendarUrl } from "../../utils/calendar";
import { nearestErUrl, hospitalMapsUrl } from "../../utils/maps";
import {
  LANGUAGES,
  speechCodeFor,
  useSpeechInput,
  sttSupported,
  sttErrorText,
} from "../../hooks/useVoice";
import SpeakButton from "../../components/SpeakButton";
import "../ConList/conlist.css";
import "./aitools.css";

// Language picker + mic button (shared by the voice-enabled tools).
const VoiceControls = ({ lang, setLang, onMic, listening }) => (
  <div className="voice-bar">
    <select
      className="voice-lang"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      title="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
    {sttSupported && onMic && (
      <button
        type="button"
        className={`mic-btn ${listening ? "on" : ""}`}
        onClick={onMic}
      >
        🎤 {listening ? "Recording…" : "Record"}
      </button>
    )}
    {!sttSupported && onMic && (
      <span className="voice-unsupported">
        🎤 Voice input needs Chrome
      </span>
    )}
  </div>
);


const TABS = [
  { key: "symptom", label: "🩺 Symptom Checker" },
  { key: "doctor", label: "🔍 Find a Doctor" },
  { key: "report", label: "📄 Report Reader" },
  { key: "hospital", label: "🏥 Find a Hospital" },
  { key: "cost", label: "💰 Cost Estimator" },
  { key: "journey", label: "🗺️ Journey Planner" },
  { key: "followup", label: "⏰ Follow-up Care" },
];

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "/Logo/lg6.png";
};

// Map common aliases / old city names to the cities we actually cover.
const CITY_ALIASES = {
  baroda: "Vadodara",
  bombay: "Mumbai",
  bengaluru: "Bangalore",
  bangaluru: "Bangalore",
  calcutta: "Kolkata",
  madras: "Chennai",
  "new delhi": "Delhi",
  gurugram: "Gurgaon",
  vizag: "Visakhapatnam",
  vishakhapatnam: "Visakhapatnam",
  mangaluru: "Mangalore",
  mysuru: "Mysore",
  trivandrum: "Thiruvananthapuram",
};

// Resolve a city from free text against our covered cities (+ aliases).
const resolveCity = (text) => {
  const t = (text || "").toLowerCase();
  for (const c of locations) if (t.includes(c.toLowerCase())) return c;
  for (const [alias, canonical] of Object.entries(CITY_ALIASES))
    if (t.includes(alias)) return canonical;
  return "";
};

/* ---------- shared cards ---------- */
const DoctorCard = ({ d, onBook }) => (
  <article className="doc-card">
    <img className="doc-photo" src={d.img} alt={d.name} loading="lazy" onError={imgFallback} />
    <div className="doc-body">
      <div className="doc-top">
        <h3>{d.name}</h3>
        <span className="cl-stars">★ {d.rating}</span>
      </div>
      <p className="doc-spec">
        {d.speciality} · {d.gender}
      </p>
      <p className="doc-qual">{d.qualifications}</p>
      <div className="doc-meta">
        <span>{d.experience} yrs</span>
        <span>·</span>
        <span>₹{d.fee} fee</span>
        <span>·</span>
        <span>{d.location}</span>
      </div>
      <button className="cl-btn cl-btn-block" onClick={() => onBook(d)}>
        Book Appointment
      </button>
    </div>
  </article>
);

const HospitalCard = ({ h, onBook, highlight }) => {
  const specs = highlight
    ? [highlight, ...h.specialities.filter((s) => s !== highlight)]
    : h.specialities;
  return (
    <article className="hosp-card">
      <div className="hosp-imgwrap">
        <img src={h.img} alt={h.name} loading="lazy" onError={imgFallback} />
        <span className="hosp-rating">★ {h.rating}</span>
      </div>
      <div className="hosp-body">
        <h3>{h.name}</h3>
        <p className="hosp-addr">📍 {h.address}</p>
        <div className="hosp-tags">
          <span className="hosp-tag">{h.priceTier}</span>
          {h.insurance && <span className="hosp-tag">Insurance</span>}
          {specs.slice(0, 3).map((s) => (
            <span
              key={s}
              className={`hosp-tag${s === highlight ? " hosp-tag-hl" : ""}`}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="hosp-actions">
          <button className="cl-btn" onClick={() => onBook(h)}>
            Book Appointment
          </button>
          <a
            className="cl-btn cl-btn-ghost"
            href={h.url}
            target="_blank"
            rel="noreferrer"
          >
            View on map
          </a>
        </div>
      </div>
    </article>
  );
};

const Disclaimer = ({ text }) => (
  <p className="ait-disclaimer">
    ⚠️ {text || "General information, not a medical diagnosis. Confirm with a doctor."}
  </p>
);

/* ---------- 1. Symptom Checker ---------- */
const SymptomChecker = () => {
  const navigate = useNavigate();
  const { hospitals: ALL_HOSPITALS } = useCatalog();
  const [symptoms, setSymptoms] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const [voiceMode, setVoiceMode] = useState(false);
  const { listening, start, stop, error: sttError } = useSpeechInput();

  const runCheck = async (override) => {
    const text = (override ?? symptoms).trim();
    if (!text) return;
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const r = await api.post("/ai/symptom-check", { symptoms: text, lang });
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't analyze right now.");
    } finally {
      setLoading(false);
    }
  };

  // Recorder: tap to start (words appear live in the box), tap again to stop →
  // it auto-analyzes and speaks the answer.
  const onRecord = () => {
    if (listening) {
      stop();
      return;
    }
    setVoiceMode(true);
    setSymptoms("");
    setRes(null);
    start(
      speechCodeFor(lang),
      (live) => setSymptoms(live), // live transcription into the box
      (finalText) => {
        if (finalText) runCheck(finalText);
      }
    );
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Describe how you feel — by typing or voice, in your language — and the AI
        suggests possible causes, urgency, and the right department.
      </p>
      <VoiceControls
        lang={lang}
        setLang={setLang}
        onMic={onRecord}
        listening={listening}
      />
      <p className="ait-record-hint">
        Tap <strong>🎤 Record</strong> and describe your problem out loud — the
        words appear below as you speak. Tap <strong>Recording…</strong> again to
        stop, and the assistant analyzes it and answers through your speaker. Or
        just type below.
      </p>
      <textarea
        className="ait-input"
        rows={3}
        placeholder="e.g. I have chest pain and dizziness"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button
        className="ait-btn"
        onClick={() => {
          setVoiceMode(false);
          runCheck();
        }}
        disabled={loading}
      >
        {loading ? "Analyzing…" : "Check Symptoms"}
      </button>
      {sttError && <div className="ait-error">{sttErrorText(sttError)}</div>}
      {error && <div className="ait-error">{error}</div>}

      {res && (
        <div className="ait-result">
          {res.emergency && (
            <div className="ait-emergency">
              <div>
                🚨 This may be a <strong>medical emergency</strong> — do not
                wait. Call an ambulance or go to the nearest ER now.
              </div>
              <div className="emerg-actions">
                <a href="tel:108" className="emerg-btn">
                  📞 Call 108 (Ambulance)
                </a>
                <a
                  href={nearestErUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="emerg-btn emerg-ghost"
                >
                  📍 Nearest ER on Google Maps
                </a>
              </div>
              {ALL_HOSPITALS.length > 0 && (
                <div className="emerg-hosps">
                  <span className="emerg-hosps-title">
                    Top-rated hospitals you can head to:
                  </span>
                  {[...ALL_HOSPITALS]
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3)
                    .map((h) => (
                      <a
                        key={h.id}
                        href={h.url || hospitalMapsUrl(h)}
                        target="_blank"
                        rel="noreferrer"
                        className="emerg-hosp"
                      >
                        <span>
                          <strong>{h.name}</strong>
                          <small>📍 {h.address}</small>
                        </span>
                        <span className="emerg-hosp-map">Directions →</span>
                      </a>
                    ))}
                </div>
              )}
            </div>
          )}
          <div className="ait-result-head">
            <span className={`ait-urgency u-${(res.urgency || "").toLowerCase()}`}>
              {res.urgency} urgency
            </span>
            <span className="ait-dept">Recommended: {res.speciality}</span>
          </div>
          <h4>Possible causes</h4>
          <ul className="ait-list">
            {res.possibleCauses?.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div className="ait-advice-head">
            <h4>Advice</h4>
            <SpeakButton
              text={`${res.advice} ${(res.possibleCauses || []).join(". ")}`}
              lang={lang}
              autoPlay={voiceMode}
            />
          </div>
          <p>{res.advice}</p>
          <button
            className="ait-btn"
            onClick={() =>
              navigate("/list", { state: { loc: "", speciality: res.speciality } })
            }
          >
            🔍 See {res.speciality} doctors
          </button>
          <Disclaimer text={res.disclaimer} />
        </div>
      )}
    </div>
  );
};

/* ---------- 2. Doctor Match ---------- */
const DoctorMatch = () => {
  const navigate = useNavigate();
  const { doctors: ALL_DOCTORS } = useCatalog();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onBook = (d) =>
    navigate("/form", {
      state: { loc: d.location, speciality: d.speciality, name: d.name },
    });

  const match = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await api.post("/ai/match-doctor", { query });
      const f = r.data;
      // Trust the query for the city (handles aliases like Baroda→Vadodara).
      f.city = resolveCity(query) || (locations.includes(f.city) ? f.city : "");
      setFilters(f);
      let list = ALL_DOCTORS.filter(
        (d) =>
          (!f.speciality || d.speciality === f.speciality) &&
          (!f.city || d.location === f.city) &&
          (!f.gender || f.gender === "any" || d.gender === f.gender) &&
          (!f.maxFee || d.fee <= f.maxFee)
      ).sort((a, b) => b.rating - a.rating);
      setResults(list.slice(0, 9));
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't search right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Describe exactly what you want — speciality, gender, city, budget — in
        plain English.
      </p>
      <div className="ait-row-input">
        <input
          className="ait-input"
          placeholder="e.g. female skin doctor in Ahmedabad under ₹1000"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && match()}
        />
        <button className="ait-btn" onClick={match} disabled={loading}>
          {loading ? "Matching…" : "Match"}
        </button>
      </div>
      {error && <div className="ait-error">{error}</div>}

      {filters && (
        <div className="ait-chips">
          {filters.speciality && <span>{filters.speciality}</span>}
          {filters.gender && filters.gender !== "any" && <span>{filters.gender}</span>}
          {filters.city && <span>{filters.city}</span>}
          {filters.maxFee > 0 && <span>≤ ₹{filters.maxFee}</span>}
        </div>
      )}
      {filters && !filters.city && (
        <p className="ait-note">
          No specific city detected — showing top-rated across India.
        </p>
      )}
      {filters && (
        <div className="cl-grid">
          {results.map((d) => (
            <DoctorCard key={d.id} d={d} onBook={onBook} />
          ))}
          {results.length === 0 && (
            <p className="cl-none">No doctors matched — try relaxing the budget or city.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------- 3. Report Reader ---------- */
const ReportReader = () => {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const explain = async () => {
    if (!text.trim() && !fileData) {
      setError("Paste report text or upload a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const payload = fileData ? { fileData, mimeType, lang } : { text, lang };
      const r = await api.post("/ai/report", payload);
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't read the report right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Upload a blood report, X-ray, or prescription (PDF or image), or paste
        the values — the AI explains it in plain language, in your language, and
        can read it aloud.
      </p>
      <VoiceControls lang={lang} setLang={setLang} listening={false} />
      <label className="ait-file">
        <input type="file" accept=".pdf,image/*" onChange={onFile} />
        {fileName ? `📎 ${fileName}` : "📎 Upload PDF or image"}
      </label>
      <div className="ait-or">or paste text</div>
      <textarea
        className="ait-input"
        rows={3}
        placeholder="e.g. Hemoglobin 10.5, WBC 11000…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="ait-btn" onClick={explain} disabled={loading}>
        {loading ? "Reading…" : "Explain my report"}
      </button>
      {error && <div className="ait-error">{error}</div>}

      {res && (
        <div className="ait-result">
          <div className="ait-advice-head">
            <h4>Summary</h4>
            <SpeakButton
              text={`${res.summary}. ${(res.findings || [])
                .map((f) => `${f.label}: ${f.meaning}`)
                .join(". ")}. ${res.advice}`}
              lang={lang}
            />
          </div>
          <p>{res.summary}</p>
          {res.findings?.length > 0 && (
            <>
              <h4>Key findings</h4>
              <ul className="ait-findings">
                {res.findings.map((f, i) => (
                  <li key={i}>
                    <strong>{f.label}</strong> — {f.meaning}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h4>What to do</h4>
          <p>{res.advice}</p>
          <Disclaimer text={res.disclaimer} />
        </div>
      )}
    </div>
  );
};

/* ---------- 4. Hospital Recommender ---------- */
const HospitalRecommender = () => {
  const navigate = useNavigate();
  const { hospitals: ALL_HOSPITALS } = useCatalog();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onBook = (h) =>
    navigate("/form", {
      state: { loc: h.location, speciality: h.specialities[0], name: h.name },
    });

  const recommend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await api.post("/ai/recommend-hospital", { query });
      const f = r.data;
      // Trust the query for the city (handles aliases like Baroda→Vadodara).
      f.city = resolveCity(query) || (locations.includes(f.city) ? f.city : "");
      setFilters(f);
      let list = ALL_HOSPITALS.filter(
        (h) =>
          (!f.speciality || h.specialities.includes(f.speciality)) &&
          (!f.city || h.location === f.city) &&
          (!f.priceTier || f.priceTier === "any" || h.priceTier === f.priceTier) &&
          (!f.needsInsurance || h.insurance)
      ).sort((a, b) => b.rating - a.rating);
      setResults(list.slice(0, 8));
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't recommend right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Tell us the condition, city, budget, or insurance need — we'll recommend
        hospitals.
      </p>
      <div className="ait-row-input">
        <input
          className="ait-input"
          placeholder="e.g. budget cancer hospital in Mumbai with insurance"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && recommend()}
        />
        <button className="ait-btn" onClick={recommend} disabled={loading}>
          {loading ? "Finding…" : "Recommend"}
        </button>
      </div>
      {error && <div className="ait-error">{error}</div>}

      {filters && (
        <div className="ait-chips">
          {filters.speciality && <span>{filters.speciality}</span>}
          {filters.city && <span>{filters.city}</span>}
          {filters.priceTier && filters.priceTier !== "any" && (
            <span>{filters.priceTier}</span>
          )}
          {filters.needsInsurance && <span>Insurance</span>}
        </div>
      )}
      {filters && !filters.city && (
        <p className="ait-note">
          No specific city detected — showing top-rated across India.
        </p>
      )}
      {filters && (
        <div className="cl-grid cl-grid-wide">
          {results.map((h) => (
            <HospitalCard
              key={h.id}
              h={h}
              onBook={onBook}
              highlight={filters.speciality}
            />
          ))}
          {results.length === 0 && (
            <p className="cl-none">No hospitals matched — try a different city or tier.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------- 5. Follow-up Care ---------- */
const FollowUp = () => {
  const [speciality, setSpeciality] = useState(specialities[0]);
  const [condition, setCondition] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = async () => {
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const r = await api.post("/ai/follow-up", { speciality, condition });
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't build a plan right now.");
    } finally {
      setLoading(false);
    }
  };

  const reminderAppt = res && {
    patientName: "Follow-up visit",
    speciality,
    provider: "Follow-up",
    datetime: new Date(
      Date.now() + (res.followUpInDays || 7) * 86400000
    ).toISOString(),
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Get a follow-up timeline and care reminders after your visit — add them
        to your calendar.
      </p>
      <div className="ait-row-input">
        <select
          className="ait-input"
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
        >
          {specialities.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          className="ait-input"
          placeholder="reason (optional), e.g. after knee surgery"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        <button className="ait-btn" onClick={plan} disabled={loading}>
          {loading ? "Planning…" : "Plan"}
        </button>
      </div>
      {error && <div className="ait-error">{error}</div>}

      {res && (
        <div className="ait-result">
          <div className="ait-result-head">
            <span className="ait-dept">
              Follow-up in {res.followUpInDays} days
            </span>
          </div>
          <h4>Care reminders</h4>
          <ul className="ait-list">
            {res.reminders?.map((rm, i) => (
              <li key={i}>{rm}</li>
            ))}
          </ul>
          <p>{res.note}</p>
          <div className="hosp-actions">
            <button className="cl-btn" onClick={() => downloadICS(reminderAppt)}>
              📅 Add follow-up reminder (.ics)
            </button>
            <a
              className="cl-btn cl-btn-ghost"
              href={googleCalendarUrl(reminderAppt)}
              target="_blank"
              rel="noreferrer"
            >
              Google Calendar
            </a>
          </div>
          <Disclaimer text={res.disclaimer} />
        </div>
      )}
    </div>
  );
};

/* ---------- 6. Cost Estimator ---------- */
const COST_TIERS = [
  { key: "government", label: "Government", tier: "Budget" },
  { key: "private", label: "Private", tier: "Mid-range" },
  { key: "premium", label: "Premium", tier: "Premium" },
];

const CostEstimator = () => {
  const navigate = useNavigate();
  const { hospitals: ALL_HOSPITALS } = useCatalog();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hospitalsForTier = (priceTier) =>
    ALL_HOSPITALS.filter(
      (h) =>
        h.priceTier === priceTier &&
        (!city || h.location === city) &&
        (!res?.speciality || h.specialities.includes(res.speciality))
    )
      .sort(
        (a, b) =>
          (b.specialityRates?.[res?.speciality] || b.successRate) -
          (a.specialityRates?.[res?.speciality] || a.successRate)
      )
      .slice(0, 3);

  const estimate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const r = await api.post("/ai/cost-estimate", { query, city });
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't estimate right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Get rough treatment cost ranges across government, private, and premium
        hospitals — no more bill-shock surprises.
      </p>
      <div className="ait-row-input">
        <input
          className="ait-input"
          placeholder="e.g. knee replacement"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && estimate()}
        />
        <select
          className="ait-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option value="">Any city</option>
          {locations.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="ait-btn" onClick={estimate} disabled={loading}>
          {loading ? "Estimating…" : "Estimate"}
        </button>
      </div>
      {error && <div className="ait-error">{error}</div>}
      {res && (
        <div className="ait-result">
          <h4>
            {res.treatment} — estimated cost{city ? ` in ${city}` : ""}
          </h4>
          <div className="cost-grid">
            {COST_TIERS.map((t) => {
              const hosps = hospitalsForTier(t.tier);
              return (
                <div key={t.key} className="cost-card">
                  <span>{t.label}</span>
                  <strong>{res[t.key]}</strong>
                  {hosps.length > 0 && (
                    <div className="cost-hosps">
                      {hosps.map((h) => (
                        <button
                          key={h.id}
                          className="cost-hosp"
                          onClick={() => navigate(`/hospital-profile/${h.id}`)}
                          title={`${h.specialityRates?.[res.speciality] ?? h.successRate}% success`}
                        >
                          🏥 {h.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {city ? null : (
            <p className="ait-note">
              Tip: pick a city above to see hospitals near you in each budget.
            </p>
          )}
          <h4>Typically includes</h4>
          <ul className="ait-list">
            {res.includes?.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
          <p>{res.note}</p>
          <Disclaimer text={res.disclaimer} />
        </div>
      )}
    </div>
  );
};

/* ---------- 7. Treatment Journey Planner ---------- */
const JourneyPlanner = () => {
  const [condition, setCondition] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = async () => {
    if (!condition.trim()) return;
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const r = await api.post("/ai/journey", { condition });
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't plan right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Get a step-by-step treatment roadmap — the stages, estimated duration,
        and cost — so you know what to expect.
      </p>
      <div className="ait-row-input">
        <input
          className="ait-input"
          placeholder="e.g. early-stage breast cancer"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && plan()}
        />
        <button className="ait-btn" onClick={plan} disabled={loading}>
          {loading ? "Planning…" : "Plan"}
        </button>
      </div>
      {error && <div className="ait-error">{error}</div>}
      {res && (
        <div className="ait-result">
          <div className="ait-result-head">
            <span className="ait-dept">⏱ {res.duration}</span>
            <span className="ait-dept">💰 {res.costRange}</span>
          </div>
          <ol className="journey">
            {res.steps?.map((s, i) => (
              <li key={i}>
                <strong>{s.step}</strong>
                <span>{s.detail}</span>
              </li>
            ))}
          </ol>
          <p>{res.note}</p>
          <Disclaimer text={res.disclaimer} />
        </div>
      )}
    </div>
  );
};

const AITools = () => {
  const [tab, setTab] = useState("symptom");

  return (
    <div className="ait-page">
      <header className="ait-hero">
        <h1>AI Health Tools</h1>
        <p>
          Smart, AI-powered help to understand symptoms, find the right doctor
          or hospital, and make sense of reports.
        </p>
      </header>

      <div className="ait-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ait-body">
        {tab === "symptom" && <SymptomChecker />}
        {tab === "doctor" && <DoctorMatch />}
        {tab === "report" && <ReportReader />}
        {tab === "hospital" && <HospitalRecommender />}
        {tab === "cost" && <CostEstimator />}
        {tab === "journey" && <JourneyPlanner />}
        {tab === "followup" && <FollowUp />}
      </div>
    </div>
  );
};

export default AITools;
