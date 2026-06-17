import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCatalog } from "../../context/CatalogContext";
import "./providerprofile.css";

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "/Logo/lg6.png";
};

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, loading } = useCatalog();

  if (loading) return <div className="pp-loading">Loading…</div>;

  const d = doctors.find((x) => x.id === id);
  if (!d) {
    return (
      <div className="pp-loading">
        Doctor not found.{" "}
        <Link to="/department" className="pp-link">
          Browse departments
        </Link>
      </div>
    );
  }

  const book = () =>
    navigate("/form", {
      state: { loc: d.location, speciality: d.speciality, name: d.name },
    });

  const stats = [
    { label: "Experience", value: `${d.experience} yrs` },
    { label: "Procedures / Surgeries", value: `${d.procedures.toLocaleString()}+` },
    { label: "Success Rate", value: `${d.successRate}%`, hi: true },
    { label: "Avg. Recovery", value: `${d.recoveryDays} days` },
    { label: "Patient Satisfaction", value: `${d.satisfaction}/5` },
    { label: "Complication Rate", value: `${d.complicationRate}%` },
    { label: "Total Consultations", value: `${d.totalConsultations.toLocaleString()}+` },
    { label: "Research Papers", value: d.publications },
  ];

  return (
    <div className="pp-page">
      <div className="pp-wrap">
        {/* Header */}
        <div className="pp-header doc">
          <img
            className="pp-avatar"
            src={d.img}
            alt={d.name}
            onError={imgFallback}
          />
          <div className="pp-id">
            <h1>{d.name}</h1>
            <p className="pp-spec">{d.speciality} Specialist</p>
            <p className="pp-qual">{d.qualifications}</p>
            <div className="pp-meta">
              <span>⭐ {d.rating} ({d.reviews} reviews)</span>
              <span>📍 {d.location}</span>
              <span>₹{d.fee} consultation</span>
            </div>
            <div className="pp-langs">
              {d.languages.map((l) => (
                <span key={l} className="pp-chip">
                  {l}
                </span>
              ))}
            </div>
            <button className="pp-book" onClick={book}>
              Book Appointment
            </button>
          </div>
        </div>

        {/* Treatment Success Intelligence */}
        <h2 className="pp-section">Treatment Success Intelligence</h2>
        <div className="pp-stats">
          {stats.map((s) => (
            <div key={s.label} className={`pp-stat ${s.hi ? "pp-stat-hi" : ""}`}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="pp-cols">
          <div className="pp-card">
            <h3>Areas of Expertise</h3>
            <div className="pp-tags">
              {d.focus.map((f) => (
                <span key={f} className="pp-tag">
                  {f}
                </span>
              ))}
            </div>
            <h3>Education</h3>
            <p className="pp-text">{d.education}</p>
            <h3>Certifications</h3>
            <ul className="pp-list">
              {d.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="pp-card">
            <h3>Awards & Recognition</h3>
            {d.awards.length ? (
              <ul className="pp-list">
                {d.awards.map((a) => (
                  <li key={a}>🏆 {a}</li>
                ))}
              </ul>
            ) : (
              <p className="pp-text">—</p>
            )}
            <h3>About</h3>
            <p className="pp-text">
              {d.name} is a {d.speciality.toLowerCase()} specialist in{" "}
              {d.location} with {d.experience} years of experience and a{" "}
              {d.successRate}% treatment success rate across{" "}
              {d.procedures.toLocaleString()}+ procedures. Known for
              patient-first, evidence-based care.
            </p>
            <button className="pp-book wide" onClick={book}>
              Book Appointment — ₹{d.fee}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
