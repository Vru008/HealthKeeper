import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api";
import { useToast } from "../../context/ToastContext";

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
  const [form, setForm] = useState({ type: "diagnosis", title: "", details: "" });
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

  const openPatient = async (p) => {
    try {
      const r = await api.get(`/records/patient/${p._id}`);
      setActive(r.data);
      setForm({ type: "diagnosis", title: "", details: "" });
    } catch (err) {
      show(err.response?.data?.error || "Couldn't open records", "error");
    }
  };

  const canAdd = active?.scopes?.includes("add");

  const addRecord = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return show("Add a title", "error");
    setAdding(true);
    try {
      await api.post(`/records/patient/${active.patient._id}`, form);
      show("Record added ✓");
      const r = await api.get(`/records/patient/${active.patient._id}`);
      setActive(r.data);
      setForm({ type: "diagnosis", title: "", details: "" });
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
