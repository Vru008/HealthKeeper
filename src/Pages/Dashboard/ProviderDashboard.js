import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import Messages from "./Messages";
import PatientsPanel from "./PatientsPanel";
import VerifyProvider from "../Verification/VerifyProvider";
import "./dashboard.css";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("appointments");
  const [unread, setUnread] = useState(0);
  const [verifStatus, setVerifStatus] = useState(null);

  useEffect(() => {
    api
      .get("/appointments/incoming")
      .then((res) => setAppts(res.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load appointments.")
      )
      .finally(() => setLoading(false));
  }, []);

  // Poll the unread counter so the badge stays current without a refresh.
  const pollUnread = useCallback(() => {
    api
      .get("/messages/unread-count")
      .then((r) => setUnread(r.data.count))
      .catch(() => {});
  }, []);
  useEffect(() => {
    pollUnread();
    const t = setInterval(pollUnread, 30000);
    return () => clearInterval(t);
  }, [pollUnread]);

  // Verification status for the header badge / tab pill.
  useEffect(() => {
    api
      .get("/verification/me")
      .then((r) => setVerifStatus(r.data.status))
      .catch(() => {});
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
          <h1>
            {user.providerName || user.name}
            {verifStatus === "verified" && (
              <span className="portal-verified" title="Verified provider">
                ✔ Verified
              </span>
            )}
          </h1>
          <p>{[user.speciality, user.city].filter(Boolean).join(" · ") || "Provider dashboard"}</p>
        </div>
      </header>

      <div className="portal-body">
        {/* Tab switcher */}
        <div className="portal-tabs">
          <button
            className={`ptab ${view === "appointments" ? "active" : ""}`}
            onClick={() => setView("appointments")}
          >
            Appointments
          </button>
          <button
            className={`ptab ${view === "messages" ? "active" : ""}`}
            onClick={() => setView("messages")}
          >
            Messages
            {unread > 0 && <span className="ptab-badge">{unread}</span>}
          </button>
          <button
            className={`ptab ${view === "patients" ? "active" : ""}`}
            onClick={() => setView("patients")}
          >
            Patients
          </button>
          <button
            className={`ptab ${view === "verification" ? "active" : ""}`}
            onClick={() => setView("verification")}
          >
            Verification
            {verifStatus && verifStatus !== "verified" && (
              <span
                className={`ptab-dot ${
                  verifStatus === "pending" ? "dot-amber" : "dot-red"
                }`}
              />
            )}
          </button>
        </div>

        {view === "verification" ? (
          <VerifyProvider role={user.role} onStatus={setVerifStatus} />
        ) : view === "patients" ? (
          <>
            <h2 className="console-title" style={{ fontSize: "20px" }}>
              Patient records shared with you
            </h2>
            <PatientsPanel />
          </>
        ) : view === "appointments" ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className="console-title" style={{ fontSize: "20px" }}>
              {isHospital ? "Patient & visitor messages" : "Messages from patients"}
            </h2>
            <Messages role={user.role} onUnread={setUnread} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
