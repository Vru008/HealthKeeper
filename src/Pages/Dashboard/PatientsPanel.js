import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api";
import { useToast } from "../../context/ToastContext";
import "../Records/records.css"; // care-plan timeline styles (tr-*)

const REC_TYPES = [
  { key: "diagnosis", label: "Diagnosis" },
  { key: "prescription", label: "Prescription" },
  { key: "lab-report", label: "Lab report" },
  { key: "imaging", label: "Imaging" },
  { key: "vaccination", label: "Vaccination" },
  { key: "note", label: "Note" },
];
const typeLabel = (k) => REC_TYPES.find((t) => t.key === k)?.label || k;

const PatientsPanel = () => {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // { patient, records, scopes }
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "diagnosis", title: "", details: "", memberId: "" });
  const [treatments, setTreatments] = useState([]);
  const [planForm, setPlanForm] = useState({ title: "", description: "" });
  const [updateDrafts, setUpdateDrafts] = useState({});
  const debounce = useRef();

  const search = useCallback((q) => {
    setLoading(true);
    api
      .get(`/records/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((r) => setPatients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    search("");
  }, [search]);

  // Debounced live search as the provider types.
  const onQuery = (v) => {
    setQuery(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(v), 300);
  };

  const loadTreatments = async (patientId) => {
    try {
      const r = await api.get(`/treatments/patient/${patientId}`);
      setTreatments(r.data);
    } catch {
      setTreatments([]);
    }
  };

  const openPatient = async (p) => {
    try {
      const r = await api.get(`/records/patient/${p._id}`);
      setActive(r.data);
      setForm({ type: "diagnosis", title: "", details: "", memberId: "" });
      setPlanForm({ title: "", description: "" });
      loadTreatments(p._id);
    } catch (err) {
      show(err.response?.data?.error || "Couldn't open records", "error");
    }
  };

  const canAdd = active?.scopes?.includes("add");

  const createPlan = async (e) => {
    e.preventDefault();
    if (!planForm.title.trim()) return show("Add a plan title", "error");
    try {
      await api.post(`/treatments/patient/${active.patient._id}`, planForm);
      setPlanForm({ title: "", description: "" });
      show("Care plan started ✓");
      loadTreatments(active.patient._id);
    } catch (err) {
      show(err.response?.data?.error || "Couldn't start plan", "error");
    }
  };

  const addUpdate = async (t) => {
    const draft = updateDrafts[t._id] || {};
    if (!draft.note || !draft.note.trim()) return show("Write an update", "error");
    try {
      await api.post(`/treatments/${t._id}/update`, {
        note: draft.note,
        status: draft.status || undefined,
      });
      setUpdateDrafts((d) => ({ ...d, [t._id]: { note: "", status: "" } }));
      show("Update posted ✓");
      loadTreatments(active.patient._id);
    } catch (err) {
      show(err.response?.data?.error || "Couldn't post update", "error");
    }
  };

  const addRecord = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return show("Add a title", "error");
    setAdding(true);
    try {
      await api.post(`/records/patient/${active.patient._id}`, form);
      show("Record added ✓");
      const r = await api.get(`/records/patient/${active.patient._id}`);
      setActive(r.data);
      setForm({ type: "diagnosis", title: "", details: "", memberId: "" });
    } catch (err) {
      show(err.response?.data?.error || "Couldn't add record", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="pp-wrap">
      <div className="pp-searchbar">
        <span className="pp-search-ic">🔍</span>
        <input
          placeholder="Search patients by name, email or phone…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      {loading && <div className="dash-skeleton" />}

      {!loading && patients.length === 0 && (
        <div className="ctable-wrap">
          <p className="ctable-empty">
            {query
              ? "No patients match your search."
              : "No patients have shared their records with you yet. When a patient grants you access from their Health Records page, they appear here."}
          </p>
        </div>
      )}

      {!loading && patients.length > 0 && (
        <div className="ctable-wrap">
          <table className="ctable">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>City</th>
                <th>Access</th>
                <th>Records</th>
                <th className="ta-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.city || "—"}</td>
                  <td>
                    {(p.scopes || []).map((s) => (
                      <span key={s} className="rec-scope-pill">
                        {s === "view" ? "View" : "Add"}
                      </span>
                    ))}
                  </td>
                  <td>{p.records}</td>
                  <td className="ta-right">
                    <button className="rbtn" onClick={() => openPatient(p)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient record drawer */}
      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div
            className="modal-card modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              {active.patient?.name}
              <span className="pp-email"> · {active.patient?.email}</span>
            </h2>

            {canAdd && (
              <form className="pp-addform" onSubmit={addRecord}>
                <div className="pp-addrow">
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
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  <button className="cbtn cbtn-primary" type="submit" disabled={adding}>
                    {adding ? "Adding…" : "Add record"}
                  </button>
                </div>
                {active.family?.length > 0 && (
                  <div className="pp-forrow">
                    <label>File under:</label>
                    <select
                      value={form.memberId}
                      onChange={(e) =>
                        setForm({ ...form, memberId: e.target.value })
                      }
                    >
                      <option value="">{active.patient?.name} (account holder)</option>
                      {active.family.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                          {m.relation ? ` (${m.relation})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <textarea
                  rows={2}
                  placeholder="Details (optional)"
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                />
              </form>
            )}

            <h3 className="vr-h">Records ({active.records.length})</h3>
            {active.records.length === 0 ? (
              <p className="ctable-empty">No records yet.</p>
            ) : (
              <div className="rec-list">
                {active.records.map((r) => (
                  <div key={r._id} className="rec-item">
                    <span className={`rec-type t-${r.type}`}>
                      {typeLabel(r.type)}
                    </span>
                    <div className="rec-item-body">
                      <strong>{r.title}</strong>
                      {r.memberName && (
                        <span className="rec-member-tag">for {r.memberName}</span>
                      )}
                      {r.details && <p>{r.details}</p>}
                      <span className="rec-meta">
                        {new Date(r.date).toLocaleDateString()} · by{" "}
                        {r.createdByName || "patient"}
                        {r.createdByRole && r.createdByRole !== "patient"
                          ? ` (${r.createdByRole})`
                          : ""}
                      </span>
                    </div>
                    {r.file?.data && (
                      <a className="rec-link" href={r.file.data} download={r.file.name}>
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Care plans */}
            <h3 className="vr-h">Care plans ({treatments.length})</h3>
            {canAdd && (
              <form className="pp-addform" onSubmit={createPlan}>
                <div className="pp-addrow">
                  <input
                    placeholder="Plan title (e.g. Diabetes management)"
                    value={planForm.title}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, title: e.target.value })
                    }
                  />
                  <button className="cbtn cbtn-primary" type="submit">
                    Start plan
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Description (optional)"
                  value={planForm.description}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, description: e.target.value })
                  }
                />
              </form>
            )}
            {treatments.length === 0 ? (
              <p className="ctable-empty">No care plans yet.</p>
            ) : (
              <div className="tr-list">
                {treatments.map((t) => (
                  <div key={t._id} className="rec-card tr-card">
                    <div className="tr-head">
                      <div>
                        <strong>{t.title}</strong>
                        {t.description && <p className="tr-desc">{t.description}</p>}
                      </div>
                      <span className={`tr-status st-${t.status}`}>{t.status}</span>
                    </div>
                    <div className="tr-timeline">
                      {[...t.updates].reverse().map((u, i) => (
                        <div key={i} className="tr-update">
                          <span className="tr-dot" />
                          <div>
                            <p>{u.note}</p>
                            <span className="tr-when">
                              {u.byName ? `${u.byName} · ` : ""}
                              {new Date(u.at).toLocaleString()}
                              {u.status ? ` · ${u.status}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {canAdd && (
                      <div className="pp-update">
                        <input
                          placeholder="Add progress update…"
                          value={updateDrafts[t._id]?.note || ""}
                          onChange={(e) =>
                            setUpdateDrafts((d) => ({
                              ...d,
                              [t._id]: { ...d[t._id], note: e.target.value },
                            }))
                          }
                        />
                        <select
                          value={updateDrafts[t._id]?.status || ""}
                          onChange={(e) =>
                            setUpdateDrafts((d) => ({
                              ...d,
                              [t._id]: { ...d[t._id], status: e.target.value },
                            }))
                          }
                        >
                          <option value="">No status change</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          className="cbtn cbtn-primary"
                          type="button"
                          onClick={() => addUpdate(t)}
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="cbtn cbtn-ghost" onClick={() => setActive(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPanel;
