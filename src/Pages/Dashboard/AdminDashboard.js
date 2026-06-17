import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { specialities, locations } from "../../data/lists";
import "./dashboard.css";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ROLES = ["patient", "doctor", "hospital", "admin"];
const blankForm = { name: "", email: "", password: "", role: "patient", phone: "", providerName: "", speciality: specialities[0], city: locations[0] };

const AdminDashboard = () => {
  const { user: me } = useAuth();
  const { show } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [modal, setModal] = useState(null); // null | "create" | user object
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Verification review state
  const [pending, setPending] = useState([]);
  const [review, setReview] = useState(null); // full submission incl. docs
  const [rejectReason, setRejectReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/appointments"),
      api.get("/verification/pending"),
    ])
      .then(([s, u, a, v]) => {
        setStats(s.data);
        setUsers(u.data);
        setAppts(a.data);
        setPending(v.data);
      })
      .catch((e) => setError(e.response?.data?.error || "Could not load admin data."))
      .finally(() => setLoading(false));
  };

  // Open a stored base64 document in a new tab via a blob URL (reliable for
  // both images and PDFs).
  const openDoc = (doc) => {
    try {
      const b64 = doc.data.split(",")[1];
      const mime =
        (doc.data.match(/data:(.*?);base64/) || [])[1] ||
        doc.mime ||
        "application/octet-stream";
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([arr], { type: mime }));
      window.open(url, "_blank");
    } catch {
      show("Couldn't open document", "error");
    }
  };

  const openReview = async (userId) => {
    setRejectReason("");
    try {
      const r = await api.get(`/verification/${userId}`);
      setReview(r.data);
    } catch {
      show("Couldn't load submission", "error");
    }
  };

  const decide = async (decision) => {
    if (decision === "rejected" && !rejectReason.trim()) {
      show("Add a reason so they know what to fix", "error");
      return;
    }
    setReviewing(true);
    try {
      await api.patch(`/verification/${review._id}/review`, {
        decision,
        reason: rejectReason,
      });
      show(decision === "verified" ? "Provider verified ✓" : "Sent back for changes");
      setReview(null);
      loadAll();
    } catch (err) {
      show(err.response?.data?.error || "Couldn't save decision", "error");
    } finally {
      setReviewing(false);
    }
  };

  useEffect(loadAll, []);

  const openCreate = () => {
    setForm(blankForm);
    setFormError("");
    setModal("create");
  };
  const openEdit = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "patient",
      phone: u.phone || "",
      providerName: u.providerName || "",
      speciality: u.speciality || specialities[0],
      city: u.city || locations[0],
    });
    setFormError("");
    setModal(u);
  };
  const closeModal = () => setModal(null);
  const onForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const isCreate = modal === "create";
    try {
      const payload = { ...form };
      if (!isCreate && !payload.password) delete payload.password; // keep existing
      if (isCreate) {
        await api.post("/admin/users", payload);
      } else {
        await api.patch(`/admin/users/${modal._id}`, payload);
      }
      closeModal();
      loadAll();
      show(isCreate ? "User created" : "Changes saved");
    } catch (err) {
      setFormError(err.response?.data?.error || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmUser) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${confirmUser._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== confirmUser._id));
      show(`${confirmUser.name} deleted`);
      setConfirmUser(null);
    } catch (err) {
      show(err.response?.data?.error || "Could not delete user.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const NAV = [
    { key: "overview", label: "Overview", icon: "▦" },
    { key: "users", label: "Users", icon: "👤" },
    { key: "verifications", label: "Verifications", icon: "🛡️" },
    { key: "appointments", label: "Appointments", icon: "📅" },
  ];

  return (
    <div className="console">
      <aside className="console-side">
        <div className="console-brand">
          <span className="console-logo">🩺</span> Admin Console
        </div>
        <nav>
          {NAV.map((n) => (
            <button
              key={n.key}
              className={tab === n.key ? "active" : ""}
              onClick={() => setTab(n.key)}
            >
              <span className="cs-ic">{n.icon}</span> {n.label}
              {n.key === "users" && <span className="cs-count">{users.length}</span>}
              {n.key === "verifications" && pending.length > 0 && (
                <span className="cs-count cs-count-alert">{pending.length}</span>
              )}
              {n.key === "appointments" && (
                <span className="cs-count">{appts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="console-me">
          Signed in as<br />
          <strong>{me?.name}</strong>
        </div>
      </aside>

      <main className="console-main">
        {error && <div className="dash-error">{error}</div>}

        {/* ---------- Overview ---------- */}
        {tab === "overview" && (
          <>
            <h1 className="console-title">Platform Overview</h1>
            {loading && <div className="dash-skeleton" />}
            {stats && (
              <div className="cstat-grid">
                <div className="cstat">
                  <span className="cstat-ic ic-blue">👥</span>
                  <div>
                    <strong>{stats.patients}</strong>
                    <span>Patients</span>
                  </div>
                </div>
                <div className="cstat">
                  <span className="cstat-ic ic-green">🩺</span>
                  <div>
                    <strong>{stats.doctors}</strong>
                    <span>Doctors</span>
                  </div>
                </div>
                <div className="cstat">
                  <span className="cstat-ic ic-amber">🏥</span>
                  <div>
                    <strong>{stats.hospitals}</strong>
                    <span>Hospitals</span>
                  </div>
                </div>
                <div className="cstat">
                  <span className="cstat-ic ic-violet">📅</span>
                  <div>
                    <strong>{stats.appointments}</strong>
                    <span>Appointments</span>
                  </div>
                </div>
              </div>
            )}
            {stats && (
              <div className="cstat-sub">
                <div>
                  <strong>{stats.booked}</strong> booked
                </div>
                <div>
                  <strong>{stats.cancelled}</strong> cancelled
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------- Users ---------- */}
        {tab === "users" && (
          <>
            <div className="console-head">
              <h1 className="console-title">Users</h1>
              <div className="console-actions">
                <input
                  className="console-search"
                  placeholder="🔍 Search name, email, role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="cbtn cbtn-primary" onClick={openCreate}>
                  + Add User
                </button>
              </div>
            </div>

            {loading && <div className="dash-skeleton" />}
            {!loading && (
              <div className="ctable-wrap">
                <table className="ctable">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th className="ta-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="ucell">
                            <span className={`uavatar av-${u.role}`}>
                              {initials(u.name)}
                            </span>
                            <div>
                              <div className="uname">{u.name}</div>
                              {u.providerName && (
                                <div className="usub">{u.providerName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`pill pill-role-${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{fmtDate(u.createdAt)}</td>
                        <td className="ta-right">
                          <button className="rbtn" onClick={() => openEdit(u)}>
                            Edit
                          </button>
                          <button
                            className="rbtn rbtn-danger"
                            onClick={() => setConfirmUser(u)}
                            disabled={u._id === me?.id}
                            title={u._id === me?.id ? "You can't delete yourself" : ""}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="ctable-empty">
                          No users match.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ---------- Verifications ---------- */}
        {tab === "verifications" && (
          <>
            <h1 className="console-title">Provider verifications</h1>
            <p className="console-sub">
              Review credentials and documents submitted by doctors and
              hospitals, then approve or request changes.
            </p>
            {loading && <div className="dash-skeleton" />}
            {!loading && (
              <div className="ctable-wrap">
                {pending.length === 0 ? (
                  <p className="ctable-empty">No submissions awaiting review.</p>
                ) : (
                  <table className="ctable">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Type</th>
                        <th>Submitted</th>
                        <th>Docs</th>
                        <th className="ta-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="ucell">
                              <span className={`uavatar av-${p.role}`}>
                                {initials(p.providerName || p.name)}
                              </span>
                              <div>
                                <div className="uname">
                                  {p.providerName || p.name}
                                </div>
                                <div className="usub">{p.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`pill pill-role-${p.role}`}>
                              {p.role}
                            </span>
                          </td>
                          <td>
                            {p.verification.submittedAt
                              ? fmtDate(p.verification.submittedAt)
                              : "—"}
                          </td>
                          <td>{p.verification.documents?.length || 0}</td>
                          <td className="ta-right">
                            <button
                              className="rbtn"
                              onClick={() => openReview(p._id)}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* ---------- Appointments ---------- */}
        {tab === "appointments" && (
          <>
            <h1 className="console-title">Appointments</h1>
            {loading && <div className="dash-skeleton" />}
            {!loading && (
              <div className="ctable-wrap">
                {appts.length === 0 ? (
                  <p className="ctable-empty">No appointments booked yet.</p>
                ) : (
                  <table className="ctable">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Provider</th>
                        <th>Speciality</th>
                        <th>City</th>
                        <th>When</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appts.map((a) => (
                        <tr key={a._id}>
                          <td>{a.patientName}</td>
                          <td>{a.provider || "—"}</td>
                          <td>{a.speciality || "—"}</td>
                          <td>{a.city || "—"}</td>
                          <td>{new Date(a.datetime).toLocaleString()}</td>
                          <td>
                            <span className={`pill pill-${a.status}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ---------- Create / Edit modal ---------- */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === "create" ? "Add User" : "Edit User"}</h2>
            {formError && <div className="dash-error">{formError}</div>}
            <form onSubmit={saveUser} className="modal-form">
              <label>Full name</label>
              <input name="name" value={form.name} onChange={onForm} required />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onForm}
                required
              />

              <label>Role</label>
              <select name="role" value={form.role} onChange={onForm}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {(form.role === "doctor" || form.role === "hospital") && (
                <>
                  <label>
                    {form.role === "hospital" ? "Hospital name" : "Display name"}
                  </label>
                  <input
                    name="providerName"
                    value={form.providerName}
                    onChange={onForm}
                    placeholder={form.role === "hospital" ? "City Care Hospital" : "Dr. Jane Doe"}
                  />
                  <label>City</label>
                  <select name="city" value={form.city} onChange={onForm}>
                    {locations.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
              {form.role === "doctor" && (
                <>
                  <label>Speciality</label>
                  <select name="speciality" value={form.speciality} onChange={onForm}>
                    {specialities.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </>
              )}

              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={onForm} />

              <label>
                Password{" "}
                {modal !== "create" && (
                  <span className="modal-hint">(leave blank to keep current)</span>
                )}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onForm}
                placeholder={modal === "create" ? "Min 6 characters" : "••••••"}
                {...(modal === "create" ? { required: true } : {})}
              />

              <div className="modal-actions">
                <button type="button" className="cbtn cbtn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="cbtn cbtn-primary" disabled={saving}>
                  {saving ? "Saving…" : modal === "create" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete confirm ---------- */}
      {confirmUser && (
        <div className="modal-backdrop" onClick={() => setConfirmUser(null)}>
          <div
            className="modal-card modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-ic">🗑️</div>
            <h2>Delete user?</h2>
            <p>
              This will permanently remove <strong>{confirmUser.name}</strong> (
              {confirmUser.email}). This can't be undone.
            </p>
            <div className="modal-actions">
              <button
                className="cbtn cbtn-ghost"
                onClick={() => setConfirmUser(null)}
              >
                Cancel
              </button>
              <button
                className="cbtn cbtn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Verification review modal ---------- */}
      {review && (
        <div className="modal-backdrop" onClick={() => setReview(null)}>
          <div
            className="modal-card modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              Review · {review.providerName || review.name}{" "}
              <span className={`pill pill-role-${review.role}`}>{review.role}</span>
            </h2>

            <h3 className="vr-h">Submitted details</h3>
            <div className="vr-fields">
              {Object.entries(review.verification?.fields || {}).map(
                ([k, v]) =>
                  v && (
                    <div key={k} className="vr-field">
                      <span className="vr-key">{k}</span>
                      <span className="vr-val">{String(v)}</span>
                    </div>
                  )
              )}
            </div>

            <h3 className="vr-h">Documents</h3>
            <div className="vr-docs">
              {(review.verification?.documents || []).map((d, i) => (
                <button
                  key={i}
                  className="vr-doc"
                  onClick={() => openDoc(d)}
                  title="Open in new tab"
                >
                  <span className="vr-doc-ic">
                    {d.mime?.startsWith("image/") ? "🖼️" : "📄"}
                  </span>
                  <span className="vr-doc-meta">
                    <strong>{d.kind}</strong>
                    <small>
                      {d.name} · {Math.round((d.size || 0) / 1024)} KB
                    </small>
                  </span>
                  <span className="vr-doc-open">Open →</span>
                </button>
              ))}
              {(review.verification?.documents || []).length === 0 && (
                <p className="ctable-empty">No documents.</p>
              )}
            </div>

            <h3 className="vr-h">Decision</h3>
            <textarea
              className="vr-reason"
              rows={2}
              placeholder="Reason (required only when requesting changes)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="cbtn cbtn-ghost"
                onClick={() => setReview(null)}
              >
                Close
              </button>
              <button
                className="cbtn cbtn-danger"
                onClick={() => decide("rejected")}
                disabled={reviewing}
              >
                Request changes
              </button>
              <button
                className="cbtn cbtn-primary"
                onClick={() => decide("verified")}
                disabled={reviewing}
              >
                {reviewing ? "Saving…" : "✔ Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
