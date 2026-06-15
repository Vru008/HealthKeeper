import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import "./dashboard.css";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/appointments/incoming")
      .then((res) => setAppts(res.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load appointments.")
      )
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = appts.filter(
    (a) => new Date(a.datetime) >= now && a.status === "booked"
  );

  const isHospital = user.role === "hospital";

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <span className="dash-role">
            {isHospital ? "Hospital portal" : "Doctor portal"}
          </span>
          <h1>{user.providerName || user.name}</h1>
          <p className="dash-sub">
            {[user.speciality, user.city].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-num">{appts.length}</span>
          <span className="stat-label">Total appointments</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{upcoming.length}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">
            {appts.filter((a) => a.status === "cancelled").length}
          </span>
          <span className="stat-label">Cancelled</span>
        </div>
      </div>

      <h2 className="dash-section-title">Appointments booked with you</h2>

      {loading && <div className="dash-skeleton" />}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && appts.length === 0 && (
        <p className="dash-empty">
          No appointments yet. When a patient books under{" "}
          <strong>{user.providerName || user.name}</strong>, it shows up here.
        </p>
      )}

      {appts.length > 0 && (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Speciality</th>
                <th>When</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a._id}>
                  <td>{a.patientName}</td>
                  <td>{a.phone || a.user?.email || "—"}</td>
                  <td>{a.speciality || "—"}</td>
                  <td>{new Date(a.datetime).toLocaleString()}</td>
                  <td>
                    <span className={`pill pill-${a.status}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
