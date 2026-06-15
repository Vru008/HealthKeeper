import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { downloadICS, googleCalendarUrl } from "../../utils/calendar";
import "./appointments.css";

const Appointments = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get("/appointments")
      .then((res) => setAppts(res.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load appointments.")
      )
      .finally(() => setLoading(false));
  }, [user]);

  const cancel = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch {
      /* ignore */
    }
  };

  if (!user) {
    return (
      <div className="appts-page">
        <div className="appts-empty">
          <h2>Please log in</h2>
          <p>Log in to view your appointments.</p>
          <Link className="appts-cta" to="/login">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="appts-page">
      <div className="appts-head">
        <h1>My Appointments</h1>
        <Link className="appts-cta" to="/department">
          + Book new
        </Link>
      </div>

      {loading && <div className="appts-skeleton" />}
      {error && <div className="appts-error">{error}</div>}

      {!loading && !error && appts.length === 0 && (
        <div className="appts-empty">
          <h2>No appointments yet</h2>
          <p>Find a doctor or hospital and book your first visit.</p>
          <Link className="appts-cta" to="/department">
            Browse Departments
          </Link>
        </div>
      )}

      <div className="appts-list">
        {appts.map((a) => {
          const past = new Date(a.datetime) < new Date();
          return (
            <div
              key={a._id}
              className={`appt-row ${a.status === "cancelled" ? "is-cancelled" : ""}`}
            >
              <div className="appt-date">
                <span className="appt-day">
                  {new Date(a.datetime).toLocaleDateString(undefined, {
                    day: "2-digit",
                  })}
                </span>
                <span className="appt-mon">
                  {new Date(a.datetime).toLocaleDateString(undefined, {
                    month: "short",
                  })}
                </span>
              </div>

              <div className="appt-info">
                <h3>{a.provider || a.speciality || "Appointment"}</h3>
                <p>
                  {[a.speciality, a.city]
                    .filter(Boolean)
                    .join(" · ")}
                  {"  "}
                  {new Date(a.datetime).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span className={`appt-status status-${a.status}`}>
                  {a.status}
                </span>
              </div>

              <div className="appt-actions">
                {a.status !== "cancelled" && !past && (
                  <>
                    <button className="ar-btn" onClick={() => downloadICS(a)}>
                      📅 .ics
                    </button>
                    <a
                      className="ar-btn"
                      href={googleCalendarUrl(a)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google
                    </a>
                    <button
                      className="ar-btn ar-danger"
                      onClick={() => cancel(a._id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Appointments;
