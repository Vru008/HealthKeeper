import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useToast } from "../../context/ToastContext";
import "./health.css";

const TYPES = [
  { key: "bp", label: "Blood Pressure", unit: "mmHg" },
  { key: "sugar", label: "Fasting Sugar", unit: "mg/dL" },
  { key: "hba1c", label: "HbA1c", unit: "%" },
  { key: "weight", label: "Weight", unit: "kg" },
];

const latestOf = (vitals, type) => vitals.find((v) => v.type === type);

const displayValue = (v) => {
  if (!v) return "—";
  if (v.type === "bp") return `${v.systolic}/${v.diastolic}`;
  return `${v.value}`;
};

// Rule-based health score + flags from the latest readings.
const analyze = (vitals) => {
  let score = 100;
  const flags = [];
  const bp = latestOf(vitals, "bp");
  const sugar = latestOf(vitals, "sugar");
  const hba1c = latestOf(vitals, "hba1c");

  if (bp) {
    if (bp.systolic >= 140 || bp.diastolic >= 90) {
      score -= 18;
      flags.push({
        text: `Blood pressure ${bp.systolic}/${bp.diastolic} is high.`,
        speciality: "Cardiology",
      });
    } else if (bp.systolic >= 130 || bp.diastolic >= 85) {
      score -= 8;
      flags.push({
        text: `Blood pressure ${bp.systolic}/${bp.diastolic} is slightly elevated.`,
        speciality: "Cardiology",
      });
    }
  }
  if (sugar) {
    if (sugar.value >= 126) {
      score -= 18;
      flags.push({
        text: `Fasting sugar ${sugar.value} mg/dL is in the diabetic range.`,
        speciality: "General Medicine",
      });
    } else if (sugar.value >= 100) {
      score -= 8;
      flags.push({
        text: `Fasting sugar ${sugar.value} mg/dL is borderline (pre-diabetic).`,
        speciality: "General Medicine",
      });
    }
  }
  if (hba1c) {
    if (hba1c.value >= 6.5) {
      score -= 18;
      flags.push({
        text: `HbA1c ${hba1c.value}% indicates diabetes — please review with a doctor.`,
        speciality: "General Medicine",
      });
    } else if (hba1c.value >= 5.7) {
      score -= 8;
      flags.push({
        text: `HbA1c ${hba1c.value}% is pre-diabetic.`,
        speciality: "General Medicine",
      });
    }
  }
  score = Math.max(45, Math.round(score));
  const band =
    score >= 85 ? "Good" : score >= 70 ? "Fair" : "Needs attention";
  return { score, band, flags };
};

const HealthCopilot = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "bp", systolic: "", diastolic: "", value: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get("/vitals")
      .then((r) => setVitals(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addVital = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload =
        form.type === "bp"
          ? { type: "bp", systolic: form.systolic, diastolic: form.diastolic }
          : { type: form.type, value: form.value };
      await api.post("/vitals", payload);
      setForm({ type: form.type, systolic: "", diastolic: "", value: "" });
      show("Reading saved");
      load();
    } catch (err) {
      show(err.response?.data?.error || "Couldn't save reading", "error");
    } finally {
      setSaving(false);
    }
  };

  const { score, band, flags } = analyze(vitals);
  const scoreClass = score >= 85 ? "hc-good" : score >= 70 ? "hc-fair" : "hc-bad";

  return (
    <div className="hc-page">
      <div className="hc-wrap">
        <h1 className="hc-title">My Health Copilot</h1>
        <p className="hc-sub">
          Track your vitals over time and get a continuous health read-out.
        </p>

        {/* Health score + vitals */}
        <div className="hc-top">
          <div className={`hc-score ${scoreClass}`}>
            <div className="hc-score-num">{vitals.length ? score : "—"}</div>
            <div className="hc-score-band">
              {vitals.length ? `Health Score · ${band}` : "Add a reading to begin"}
            </div>
          </div>

          <div className="hc-vitals">
            {TYPES.map((t) => {
              const v = latestOf(vitals, t.key);
              return (
                <div key={t.key} className="hc-vital">
                  <span className="hc-vital-label">{t.label}</span>
                  <strong>
                    {displayValue(v)}{" "}
                    {v && <small>{t.unit}</small>}
                  </strong>
                  <span className="hc-vital-count">
                    {vitals.filter((x) => x.type === t.key).length} readings
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add reading */}
        <div className="hc-card">
          <h3>Log a reading</h3>
          <form className="hc-form" onSubmit={addVital}>
            <select name="type" value={form.type} onChange={onForm}>
              {TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            {form.type === "bp" ? (
              <>
                <input
                  name="systolic"
                  type="number"
                  placeholder="Systolic"
                  value={form.systolic}
                  onChange={onForm}
                />
                <input
                  name="diastolic"
                  type="number"
                  placeholder="Diastolic"
                  value={form.diastolic}
                  onChange={onForm}
                />
              </>
            ) : (
              <input
                name="value"
                type="number"
                step="0.1"
                placeholder="Value"
                value={form.value}
                onChange={onForm}
              />
            )}
            <button className="hc-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add"}
            </button>
          </form>
        </div>

        {/* Insights */}
        <div className="hc-card">
          <h3>Insights &amp; recommendations</h3>
          {loading ? (
            <p className="hc-muted">Loading…</p>
          ) : !vitals.length ? (
            <p className="hc-muted">
              Log your blood pressure, sugar, HbA1c, or weight to get
              personalized insights.
            </p>
          ) : flags.length ? (
            <ul className="hc-flags">
              {flags.map((f, i) => (
                <li key={i}>
                  <span>⚠️ {f.text}</span>
                  <button
                    className="hc-link"
                    onClick={() =>
                      navigate("/list", {
                        state: { loc: "", speciality: f.speciality },
                      })
                    }
                  >
                    See {f.speciality} doctors →
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hc-ok">✓ Your tracked vitals look healthy. Keep it up!</p>
          )}
          <p className="hc-disclaimer">
            ⚠️ General guidance from your readings, not a medical diagnosis.
          </p>
        </div>

        {/* History */}
        {vitals.length > 0 && (
          <div className="hc-card">
            <h3>Recent readings</h3>
            <div className="hc-history">
              {vitals.slice(0, 12).map((v) => (
                <div key={v._id} className="hc-row">
                  <span>{TYPES.find((t) => t.key === v.type)?.label}</span>
                  <strong>
                    {displayValue(v)} {TYPES.find((t) => t.key === v.type)?.unit}
                  </strong>
                  <span className="hc-date">
                    {new Date(v.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCopilot;
