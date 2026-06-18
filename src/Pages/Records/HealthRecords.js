import React, { useEffect, useState, useMemo } from "react";
import api from "../../api";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";
import SearchableSelect from "../../components/SearchableSelect";
import "./records.css";

const REC_TYPES = [
  { key: "diagnosis", label: "Diagnosis" },
  { key: "prescription", label: "Prescription" },
  { key: "lab-report", label: "Lab report" },
  { key: "imaging", label: "Imaging" },
  { key: "vaccination", label: "Vaccination" },
  { key: "note", label: "Note" },
];
const typeLabel = (k) => REC_TYPES.find((t) => t.key === k)?.label || k;
const MAX_BYTES = 3 * 1024 * 1024;

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const HealthRecords = () => {
  const { doctors, hospitals } = useCatalog();
  const { show } = useToast();
  const [tab, setTab] = useState("records");
  const [records, setRecords] = useState([]);
  const [consents, setConsents] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  // add-record form
  const [form, setForm] = useState({ type: "diagnosis", title: "", details: "", date: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // sharing form
  const [shareType, setShareType] = useState("doctor");
  const [shareProvider, setShareProvider] = useState(null);
  const [shareScopes, setShareScopes] = useState({ view: true, add: false });

  const load = () => {
    Promise.all([
      api.get("/records/mine"),
      api.get("/records/consents"),
      api.get("/records/audit"),
    ])
      .then(([r, c, a]) => {
        setRecords(r.data);
        setConsents(c.data);
        setAudit(a.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const doctorOptions = useMemo(
    () =>
      doctors.map((d) => ({
        value: d.id,
        label: d.name,
        sub: `${d.speciality} · ${d.location}`,
        keywords: `${d.name} ${d.speciality} ${d.location}`,
        raw: d,
      })),
    [doctors]
  );
  const hospitalOptions = useMemo(
    () =>
      hospitals.map((h) => ({
        value: h.id,
        label: h.name,
        sub: `${(h.specialities || []).slice(0, 3).join(", ")} · ${h.location}`,
        keywords: `${h.name} ${(h.specialities || []).join(" ")} ${h.location}`,
        raw: h,
      })),
    [hospitals]
  );

  const onFile = async (f) => {
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) return show("File too large (max 3 MB)", "error");
    try {
      const data = await readFile(f);
      setFile({ name: f.name, mime: f.type, size: f.size, data });
    } catch {
      show("Couldn't read file", "error");
    }
  };

  const addRecord = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return show("Add a title", "error");
    setSaving(true);
    try {
      await api.post("/records", { ...form, file: file || undefined });
      setForm({ type: "diagnosis", title: "", details: "", date: "" });
      setFile(null);
      show("Record added ✓");
      load();
    } catch (err) {
      show(err.response?.data?.error || "Couldn't add record", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/records/${id}`);
      show("Record deleted");
      load();
    } catch {
      show("Delete failed", "error");
    }
  };

  const grant = async (e) => {
    e.preventDefault();
    if (!shareProvider) return show(`Select a ${shareType} to share with`, "error");
    const scopes = Object.entries(shareScopes).filter(([, v]) => v).map(([k]) => k);
    try {
      await api.post("/records/consents", {
        providerName: shareProvider.label,
        providerRole: shareType,
        scopes,
      });
      show(`Shared with ${shareProvider.label}`);
      setShareProvider(null);
      setShareScopes({ view: true, add: false });
      load();
    } catch (err) {
      show(err.response?.data?.error || "Couldn't share", "error");
    }
  };

  const revoke = async (id) => {
    try {
      await api.patch(`/records/consents/${id}/revoke`);
      show("Access revoked");
      load();
    } catch {
      show("Couldn't revoke", "error");
    }
  };

  const activeGrants = consents.filter((c) => c.status === "active");

  return (
    <div className="rec-page">
      <div className="rec-wrap">
        <h1 className="rec-title">My Health Records</h1>
        <p className="rec-sub">
          Your records, in one place — and full control over who can see them.
        </p>

        <div className="rec-tabs">
          {[
            ["records", `Records (${records.length})`],
            ["sharing", `Sharing (${activeGrants.length})`],
            ["audit", "Access log"],
          ].map(([k, label]) => (
            <button
              key={k}
              className={`rec-tab ${tab === k ? "active" : ""}`}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <div className="dash-skeleton" />}

        {/* ---- Records ---- */}
        {!loading && tab === "records" && (
          <>
            <form className="rec-card rec-form" onSubmit={addRecord}>
              <h3>Add a record</h3>
              <div className="rec-form-grid">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {REC_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Title (e.g. Blood test — CBC)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Details (optional)"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
              <div className="rec-form-foot">
                <label className="rec-file">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => onFile(e.target.files[0])}
                  />
                  <span>{file ? `📎 ${file.name}` : "📎 Attach file (optional)"}</span>
                </label>
                <button className="rec-btn" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Add record"}
                </button>
              </div>
            </form>

            {records.length === 0 ? (
              <div className="rec-card">
                <p className="rec-empty">No records yet. Add your first above.</p>
              </div>
            ) : (
              <div className="rec-list">
                {records.map((r) => (
                  <div key={r._id} className="rec-item">
                    <span className={`rec-type t-${r.type}`}>{typeLabel(r.type)}</span>
                    <div className="rec-item-body">
                      <strong>{r.title}</strong>
                      {r.details && <p>{r.details}</p>}
                      <span className="rec-meta">
                        {new Date(r.date).toLocaleDateString()} · added by{" "}
                        {r.createdByName || "you"}
                        {r.createdByRole && r.createdByRole !== "patient"
                          ? ` (${r.createdByRole})`
                          : ""}
                      </span>
                    </div>
                    <div className="rec-item-actions">
                      {r.file?.data && (
                        <a
                          className="rec-link"
                          href={r.file.data}
                          download={r.file.name}
                        >
                          Download
                        </a>
                      )}
                      <button
                        className="rec-link danger"
                        onClick={() => deleteRecord(r._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- Sharing ---- */}
        {!loading && tab === "sharing" && (
          <>
            <form className="rec-card rec-form" onSubmit={grant}>
              <h3>Share access with a provider</h3>
              <div className="rec-seg">
                <button
                  type="button"
                  className={shareType === "doctor" ? "seg active" : "seg"}
                  onClick={() => {
                    setShareType("doctor");
                    setShareProvider(null);
                  }}
                >
                  🩺 Doctor
                </button>
                <button
                  type="button"
                  className={shareType === "hospital" ? "seg active" : "seg"}
                  onClick={() => {
                    setShareType("hospital");
                    setShareProvider(null);
                  }}
                >
                  🏥 Hospital
                </button>
              </div>
              <SearchableSelect
                options={shareType === "doctor" ? doctorOptions : hospitalOptions}
                value={shareProvider?.value}
                onChange={setShareProvider}
                placeholder={`Search ${shareType}s by name, department or city`}
              />
              <div className="rec-scopes">
                <label>
                  <input
                    type="checkbox"
                    checked={shareScopes.view}
                    onChange={(e) =>
                      setShareScopes({ ...shareScopes, view: e.target.checked })
                    }
                  />
                  Can view my records
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={shareScopes.add}
                    onChange={(e) =>
                      setShareScopes({ ...shareScopes, add: e.target.checked })
                    }
                  />
                  Can add new records
                </label>
              </div>
              <button className="rec-btn" type="submit">
                Grant access
              </button>
            </form>

            <div className="rec-card">
              <h3>Who has access</h3>
              {activeGrants.length === 0 ? (
                <p className="rec-empty">
                  You haven't shared your records with anyone yet.
                </p>
              ) : (
                <div className="rec-grants">
                  {activeGrants.map((c) => (
                    <div key={c._id} className="rec-grant">
                      <div>
                        <strong>{c.providerName}</strong>
                        <span className="rec-grant-role">{c.providerRole}</span>
                        <div className="rec-grant-scopes">
                          {c.scopes.map((s) => (
                            <span key={s} className="rec-scope-pill">
                              {s === "view" ? "View" : "Add"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="rec-link danger"
                        onClick={() => revoke(c._id)}
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ---- Access log ---- */}
        {!loading && tab === "audit" && (
          <div className="rec-card">
            <h3>Access log</h3>
            <p className="rec-sub2">
              Every time someone views or updates your records, it's recorded here.
            </p>
            {audit.length === 0 ? (
              <p className="rec-empty">No activity yet.</p>
            ) : (
              <div className="rec-audit">
                {audit.map((a) => (
                  <div key={a._id} className="rec-audit-row">
                    <span className={`rec-audit-act act-${a.action}`}>
                      {a.action.replace(/-/g, " ")}
                    </span>
                    <span className="rec-audit-who">
                      <strong>{a.actorName}</strong>
                      {a.actorRole ? ` (${a.actorRole})` : ""}
                      {a.meta ? ` · ${a.meta}` : ""}
                    </span>
                    <span className="rec-audit-date">
                      {new Date(a.at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
