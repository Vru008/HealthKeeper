import React, { useEffect, useState } from "react";
import api from "../../api";
import "./dashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appts, setAppts] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/appointments"),
    ])
      .then(([s, u, a]) => {
        setStats(s.data);
        setUsers(u.data);
        setAppts(a.data);
      })
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load admin data.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <span className="dash-role">Admin portal</span>
          <h1>Platform Overview</h1>
          <p className="dash-sub">Manage users and appointments across HealthKeeper.</p>
        </div>
      </div>

      {error && <div className="dash-error">{error}</div>}
      {loading && <div className="dash-skeleton" />}

      {stats && (
        <div className="dash-stats dash-stats-4">
          <div className="stat-card">
            <span className="stat-num">{stats.patients}</span>
            <span className="stat-label">Patients</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.doctors}</span>
            <span className="stat-label">Doctors</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.hospitals}</span>
            <span className="stat-label">Hospitals</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.appointments}</span>
            <span className="stat-label">Appointments</span>
          </div>
        </div>
      )}

      {stats && (
        <div className="dash-tabs">
          <button
            className={tab === "users" ? "active" : ""}
            onClick={() => setTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            className={tab === "appts" ? "active" : ""}
            onClick={() => setTab("appts")}
          >
            Appointments ({appts.length})
          </button>
        </div>
      )}

      {tab === "users" && users.length > 0 && (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`pill pill-role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "appts" && (
        <div className="dash-table-wrap">
          {appts.length === 0 ? (
            <p className="dash-empty">No appointments booked yet.</p>
          ) : (
            <table className="dash-table">
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
                      <span className={`pill pill-${a.status}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
