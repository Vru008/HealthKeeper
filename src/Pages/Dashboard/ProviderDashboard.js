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
  ).length;
  const cancelled = appts.filter((a) => a.status === "cancelled").length;
  const isHospital = user.role === "hospital";

  return (
    <div className="portal">
      <header className={`portal-header ${isHospital ? "ph-hospital" : "ph-doctor"}`}>
        <div className="portal-inner">
          <span className="portal-badge">
            {isHospital ? "🏥 Hospital portal" : "🩺 Doctor portal"}
          </span>
          <h1>{user.providerName || user.name}</h1>
          <p>{[user.speciality, user.city].filter(Boolean).join(" · ") || "Provider dashboard"}</p>
        </div>
      </header>

      <div className="portal-body">
        <div className="cstat-grid cstat-3">
          <div className="cstat">
            <span className="cstat-ic ic-blue">📋</span>
            <div>
              <strong>{appts.length}</strong>
              <span>Total appointments</span>
            </div>
          </div>
          <div className="cstat">
            <span className="cstat-ic ic-green">⏰</span>
            <div>
              <strong>{upcoming}</strong>
              <span>Upcoming</span>
            </div>
          </div>
          <div className="cstat">
            <span className="cstat-ic ic-amber">✖</span>
            <div>
              <strong>{cancelled}</strong>
              <span>Cancelled</span>
            </div>
          </div>
        </div>

        <h2 className="console-title" style={{ fontSize: "20px" }}>
          Appointments booked with you
        </h2>

        {loading && <div className="dash-skeleton" />}
        {error && <div className="dash-error">{error}</div>}
        {!loading && !error && appts.length === 0 && (
          <div className="ctable-wrap">
            <p className="ctable-empty">
              No appointments yet. When a patient books under{" "}
              <strong>{user.providerName || user.name}</strong>, it appears here.
            </p>
          </div>
        )}

        {appts.length > 0 && (
          <div className="ctable-wrap">
            <table className="ctable">
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
    </div>
  );
};

export default ProviderDashboard;
