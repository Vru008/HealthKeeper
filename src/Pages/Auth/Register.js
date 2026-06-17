import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCatalog } from "../../context/CatalogContext";
import { specialities, locations } from "../../data/lists";
import SearchableSelect from "../../components/SearchableSelect";
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
  const { doctors, hospitals, loading: catLoading } = useCatalog();

  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    providerId: "",
    providerName: "",
    speciality: specialities[0],
    city: locations[0],
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Searchable option lists from the catalog (search by name / dept / city).
  const doctorOptions = useMemo(
    () =>
      doctors.map((d) => ({
        value: d.id,
        label: d.name,
        sub: `${d.speciality} · ${d.location}`,
        keywords: `${d.name} ${d.speciality} ${d.location}`,
        raw: d,
      })),
    [doctors]
  );
  const hospitalOptions = useMemo(
    () =>
      hospitals.map((h) => ({
        value: h.id,
        label: h.name,
        sub: `${(h.specialities || []).slice(0, 3).join(", ")} · ${h.location}`,
        keywords: `${h.name} ${(h.specialities || []).join(" ")} ${h.location}`,
        raw: h,
      })),
    [hospitals]
  );

  // Picking a catalog entry locks the account to that provider so messages and
  // appointments route correctly (they match on provider name).
  const pickDoctor = (o) =>
    setForm((f) => ({
      ...f,
      providerId: o.raw.id,
      providerName: o.raw.name,
      speciality: o.raw.speciality,
      city: o.raw.location,
    }));
  const pickHospital = (o) =>
    setForm((f) => ({
      ...f,
      providerId: o.raw.id,
      providerName: o.raw.name,
      city: o.raw.location,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if ((role === "doctor" || role === "hospital") && !form.providerName) {
      setError(`Please select your ${role} listing from the dropdown.`);
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
              <label>Select your doctor profile</label>
              <SearchableSelect
                options={doctorOptions}
                value={form.providerId}
                onChange={pickDoctor}
                placeholder={
                  catLoading
                    ? "Loading doctors…"
                    : "Search your name, speciality or city"
                }
              />
              {form.providerName && (
                <p className="auth-pick-note">
                  Registering as <strong>{form.providerName}</strong> —{" "}
                  {form.speciality} · {form.city}
                </p>
              )}
            </>
          )}

          {role === "hospital" && (
            <>
              <label>Select your hospital</label>
              <SearchableSelect
                options={hospitalOptions}
                value={form.providerId}
                onChange={pickHospital}
                placeholder={
                  catLoading
                    ? "Loading hospitals…"
                    : "Search hospital name, department or city"
                }
              />
              {form.providerName && (
                <p className="auth-pick-note">
                  Registering as <strong>{form.providerName}</strong> —{" "}
                  {form.city}
                </p>
              )}
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
