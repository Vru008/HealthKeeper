import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { specialities, locations } from "../../data/catalog";
import "./auth.css";

const ROLES = [
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Doctor" },
  { key: "hospital", label: "Hospital" },
  { key: "admin", label: "Admin" },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    providerName: "",
    speciality: specialities[0],
    city: locations[0],
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not sign up. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join HealthKeeper as a…</p>

        <div className="role-tabs">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.key}
              className={`role-tab ${role === r.key ? "active" : ""}`}
              onClick={() => setRole(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="name">
            {role === "hospital" ? "Contact name" : "Full name"}
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

          {role === "doctor" && (
            <>
              <label htmlFor="providerName">
                Display name (as patients see you)
              </label>
              <input
                id="providerName"
                name="providerName"
                value={form.providerName}
                onChange={handleChange}
                placeholder="Dr. Jane Doe"
              />
              <label htmlFor="speciality">Speciality</label>
              <select
                id="speciality"
                name="speciality"
                value={form.speciality}
                onChange={handleChange}
              >
                {specialities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
              >
                {locations.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </>
          )}

          {role === "hospital" && (
            <>
              <label htmlFor="providerName">Hospital name</label>
              <input
                id="providerName"
                name="providerName"
                value={form.providerName}
                onChange={handleChange}
                placeholder="City Care Hospital"
              />
              <label htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
              >
                {locations.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 00000 00000"
          />

          {role === "admin" && (
            <>
              <label htmlFor="adminCode">Admin code</label>
              <input
                id="adminCode"
                name="adminCode"
                value={form.adminCode}
                onChange={handleChange}
                placeholder="Provided by your administrator"
              />
            </>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
