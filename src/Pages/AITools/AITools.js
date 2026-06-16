import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import {
  doctors as ALL_DOCTORS,
  hospitals as ALL_HOSPITALS,
  specialities,
  locations,
} from "../../data/catalog";
import { downloadICS, googleCalendarUrl } from "../../utils/calendar";
import "../ConList/conlist.css";
import "./aitools.css";

const TABS = [
  { key: "symptom", label: "🩺 Symptom Checker" },
  { key: "doctor", label: "🔍 Find a Doctor" },
  { key: "report", label: "📄 Report Reader" },
  { key: "hospital", label: "🏥 Find a Hospital" },
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
  const [symptoms, setSymptoms] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setRes(null);
    try {
      const r = await api.post("/ai/symptom-check", { symptoms });
      setRes(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't analyze right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ait-tool">
      <p className="ait-lead">
        Describe how you feel and the AI will suggest possible causes, urgency,
        and the right department.
      </p>
      <textarea
        className="ait-input"
        rows={3}
        placeholder="e.g. I have chest pain and dizziness"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button className="ait-btn" onClick={check} disabled={loading}>
        {loading ? "Analyzing…" : "Check Symptoms"}
      </button>
      {error && <div className="ait-error">{error}</div>}

      {res && (
        <div className="ait-result">
          {res.emergency && (
            <div className="ait-emergency">
              🚨 This may be a medical emergency. Call your local emergency
              number or go to the nearest ER immediately. Do not wait.
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
          <h4>Advice</h4>
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
      const payload = fileData ? { fileData, mimeType } : { text };
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
        the values — the AI explains it in plain language.
      </p>
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
          <h4>Summary</h4>
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
        {tab === "followup" && <FollowUp />}
      </div>
    </div>
  );
};

export default AITools;
