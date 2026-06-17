import React, { useEffect, useState } from "react";
import api from "../../api";
import { useToast } from "../../context/ToastContext";
import { specialities, locations } from "../../data/lists";
import "./verify.css";

const MAX_BYTES = 2 * 1024 * 1024;

// The real-world onboarding "formalities" for each provider type.
const FORMS = {
  doctor: {
    title: "Doctor verification",
    intro:
      "To list as a verified doctor on HealthKeeper, confirm your medical credentials. Our team reviews every submission before approval.",
    fields: [
      { key: "fullName", label: "Full name (as on medical register)", required: true },
      { key: "regNumber", label: "Medical registration / license no.", required: true },
      {
        key: "council",
        label: "Issuing medical council",
        required: true,
        placeholder: "e.g. National Medical Commission / State Medical Council",
      },
      { key: "councilState", label: "Council state", type: "select", options: locations, required: true },
      { key: "regYear", label: "Year of registration", type: "number", required: true },
      { key: "speciality", label: "Primary speciality", type: "select", options: specialities, required: true },
      { key: "qualifications", label: "Qualifications", required: true, placeholder: "MBBS, MD…" },
      { key: "experience", label: "Years of experience", type: "number", required: true },
      { key: "affiliation", label: "Current clinic / hospital", required: false },
      { key: "city", label: "Practising city", type: "select", options: locations, required: true },
    ],
    docs: [
      { key: "Medical degree certificate", required: true },
      { key: "Medical council registration certificate", required: true },
      { key: "Government photo ID (Aadhaar / PAN)", required: true },
      { key: "Recent passport-size photo", required: true },
    ],
  },
  hospital: {
    title: "Hospital verification",
    intro:
      "To list as a verified facility, confirm your establishment's registration and statutory documents. Our team reviews every submission before approval.",
    fields: [
      { key: "legalName", label: "Registered hospital name", required: true },
      { key: "regNumber", label: "Clinical Establishment registration no.", required: true },
      {
        key: "estType",
        label: "Establishment type",
        type: "select",
        options: ["Multi-speciality hospital", "Single-speciality hospital", "Nursing home", "Clinic / Polyclinic", "Diagnostic centre"],
        required: true,
      },
      { key: "ownerName", label: "Authorised person name", required: true },
      { key: "designation", label: "Designation", required: true, placeholder: "Medical Superintendent / Owner" },
      { key: "contact", label: "Official contact number", required: true },
      { key: "address", label: "Full address", required: true },
      { key: "city", label: "City", type: "select", options: locations, required: true },
      { key: "gstNumber", label: "GST number", required: false },
    ],
    docs: [
      { key: "Clinical Establishment registration certificate", required: true },
      { key: "Authorised signatory ID", required: true },
      { key: "GST registration certificate", required: false },
      { key: "Fire safety NOC", required: false },
      { key: "Biomedical waste authorisation", required: false },
      { key: "NABH / accreditation certificate", required: false },
    ],
  },
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const StatusPill = ({ status }) => {
  const map = {
    unverified: ["Not submitted", "vp-grey"],
    pending: ["Under review", "vp-amber"],
    verified: ["Verified", "vp-green"],
    rejected: ["Changes requested", "vp-red"],
  };
  const [label, cls] = map[status] || map.unverified;
  return <span className={`vp-pill ${cls}`}>{label}</span>;
};

const VerifyProvider = ({ role, onStatus }) => {
  const { show } = useToast();
  const cfg = FORMS[role];
  const [verif, setVerif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({});
  const [docs, setDocs] = useState({}); // { kind: {name,size,mime,data} }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/verification/me")
      .then((r) => {
        setVerif(r.data);
        setFields(r.data.fields || {});
        onStatus?.(r.data.status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onStatus]);

  const onField = (key, val) => setFields((f) => ({ ...f, [key]: val }));

  const onFile = async (kind, file) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      show(`"${kind}" is too large (max 2 MB)`, "error");
      return;
    }
    try {
      const data = await readFile(file);
      setDocs((d) => ({
        ...d,
        [kind]: { name: file.name, size: file.size, mime: file.type, data },
      }));
    } catch {
      show("Couldn't read that file", "error");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    // Validate required fields
    for (const f of cfg.fields) {
      if (f.required && !String(fields[f.key] || "").trim()) {
        show(`Please fill: ${f.label}`, "error");
        return;
      }
    }
    // Validate required documents
    for (const d of cfg.docs) {
      if (d.required && !docs[d.key]) {
        show(`Please upload: ${d.key}`, "error");
        return;
      }
    }
    const documents = Object.entries(docs).map(([kind, v]) => ({ kind, ...v }));
    setSaving(true);
    try {
      const r = await api.post("/verification/submit", { fields, documents });
      setVerif(r.data);
      onStatus?.(r.data.status);
      setDocs({});
      show("Submitted for verification ✓");
    } catch (err) {
      show(err.response?.data?.error || "Couldn't submit", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dash-skeleton" />;

  const status = verif?.status || "unverified";
  const showForm = status === "unverified" || status === "rejected";

  return (
    <div className="vp-wrap">
      <div className="vp-head">
        <div>
          <h2>{cfg.title}</h2>
          <p className="vp-intro">{cfg.intro}</p>
        </div>
        <StatusPill status={status} />
      </div>

      {status === "verified" && (
        <div className="vp-banner vp-b-green">
          <span className="vp-ic">✅</span>
          <div>
            <strong>Your account is verified.</strong>
            <p>
              Approved on{" "}
              {verif.reviewedAt
                ? new Date(verif.reviewedAt).toLocaleDateString()
                : "—"}
              . Patients now see a verified badge on your profile.
            </p>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="vp-banner vp-b-amber">
          <span className="vp-ic">⏳</span>
          <div>
            <strong>Verification under review.</strong>
            <p>
              Submitted{" "}
              {verif.submittedAt
                ? new Date(verif.submittedAt).toLocaleString()
                : ""}
              . We'll email you once it's reviewed (usually 1–2 business days).
            </p>
            <p className="vp-doclist">
              {verif.documents?.length || 0} document(s) submitted:{" "}
              {(verif.documents || []).map((d) => d.kind).join(", ")}
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && verif.rejectionReason && (
        <div className="vp-banner vp-b-red">
          <span className="vp-ic">⚠️</span>
          <div>
            <strong>More information needed.</strong>
            <p>{verif.rejectionReason}</p>
            <p>Please correct the details below and resubmit.</p>
          </div>
        </div>
      )}

      {showForm && (
        <form className="vp-form" onSubmit={submit}>
          <h3>Credentials</h3>
          <div className="vp-grid">
            {cfg.fields.map((f) => (
              <div key={f.key} className="vp-field">
                <label>
                  {f.label} {f.required && <span className="vp-req">*</span>}
                </label>
                {f.type === "select" ? (
                  <select
                    value={fields[f.key] || ""}
                    onChange={(e) => onField(f.key, e.target.value)}
                  >
                    <option value="">Select…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={fields[f.key] || ""}
                    placeholder={f.placeholder || ""}
                    onChange={(e) => onField(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <h3>Documents</h3>
          <p className="vp-hint">
            Upload clear scans or photos (PDF / JPG / PNG, max 2 MB each).
          </p>
          <div className="vp-docs">
            {cfg.docs.map((d) => (
              <div key={d.key} className="vp-doc">
                <div className="vp-doc-label">
                  {d.key}{" "}
                  {d.required ? (
                    <span className="vp-req">*</span>
                  ) : (
                    <span className="vp-opt">(optional)</span>
                  )}
                </div>
                <label className="vp-upload">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => onFile(d.key, e.target.files[0])}
                  />
                  <span>{docs[d.key] ? "Change file" : "Choose file"}</span>
                </label>
                {docs[d.key] && (
                  <span className="vp-doc-ok">
                    ✓ {docs[d.key].name} (
                    {Math.round(docs[d.key].size / 1024)} KB)
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="vp-consent">
            <label>
              <input type="checkbox" required /> I confirm these details are
              accurate and the documents are genuine.
            </label>
          </div>

          <button className="vp-submit" type="submit" disabled={saving}>
            {saving ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
};

export default VerifyProvider;
