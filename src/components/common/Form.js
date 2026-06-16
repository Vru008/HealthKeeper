import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  downloadICS,
  googleCalendarUrl,
  notifyBooking,
} from "../../utils/calendar";
import { locations as cities, specialities as departments } from "../../data/lists";
import "./form.css";

const Form = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = location.state || {};

  const [form, setForm] = useState({
    patientName: user?.name || "",
    phone: user?.phone || "",
    gender: "Male",
    city: prefill.loc || "",
    speciality: prefill.speciality || "",
    provider: prefill.name || "",
    datetime: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Booking requires an account.
  if (!user) {
    return (
      <div className="form-page">
        <div className="form-gate">
          <h2>Log in to book an appointment</h2>
          <p>Create a free account so we can save your booking and reminders.</p>
          <div className="form-gate-actions">
            <Link
              className="fbtn fbtn-primary"
              to="/login"
              state={{ from: "/form" }}
            >
              Log In
            </Link>
            <Link className="fbtn fbtn-ghost" to="/register">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.patientName || !form.datetime) {
      setError("Please enter your name and choose a date & time.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/appointments", form);
      setBooked(res.data);
      notifyBooking(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not book. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirmation + reminder actions
  if (booked) {
    return (
      <div className="form-page">
        <div className="confirm-card">
          <div className="confirm-check">✓</div>
          <h2>Appointment booked!</h2>
          <p className="confirm-when">
            {new Date(booked.datetime).toLocaleString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <ul className="confirm-details">
            {booked.provider && (
              <li>
                <span>With</span>
                {booked.provider}
              </li>
            )}
            {booked.speciality && (
              <li>
                <span>Speciality</span>
                {booked.speciality}
              </li>
            )}
            {booked.city && (
              <li>
                <span>City</span>
                {booked.city}
              </li>
            )}
          </ul>

          {booked.emailSent && (
            <p className="confirm-email">
              📧 Confirmation email sent to {booked.email}
            </p>
          )}

          <p className="confirm-remind">Set a reminder on your device:</p>
          <div className="confirm-actions">
            <button
              className="fbtn fbtn-primary"
              onClick={() => downloadICS(booked)}
            >
              📅 Add to Calendar (.ics)
            </button>
            <a
              className="fbtn fbtn-ghost"
              href={googleCalendarUrl(booked)}
              target="_blank"
              rel="noreferrer"
            >
              Google Calendar
            </a>
          </div>
          <button
            className="confirm-link"
            onClick={() => navigate("/appointments")}
          >
            View my appointments →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <form className="appt-form" onSubmit={handleSubmit}>
        <h2 className="appt-title">Book an Appointment</h2>
        <p className="appt-sub">Fill in the details and we'll set a reminder.</p>

        {error && <div className="appt-error">{error}</div>}

        {form.provider && (
          <div className="appt-provider">
            Booking with <strong>{form.provider}</strong>
          </div>
        )}

        <div className="appt-grid">
          <div className="appt-field">
            <label htmlFor="patientName">Full name</label>
            <input
              id="patientName"
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              placeholder="Patient name"
              required
            />
          </div>

          <div className="appt-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Contact number"
            />
          </div>

          <div className="appt-field">
            <label htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="appt-field">
            <label htmlFor="speciality">Department</label>
            <select
              id="speciality"
              name="speciality"
              value={form.speciality}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="appt-field">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="appt-field">
            <label htmlFor="datetime">Date &amp; time</label>
            <input
              id="datetime"
              type="datetime-local"
              name="datetime"
              value={form.datetime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="fbtn fbtn-primary appt-submit" disabled={loading}>
          {loading ? "Booking…" : "Confirm Appointment"}
        </button>
      </form>
    </div>
  );
};

export default Form;
