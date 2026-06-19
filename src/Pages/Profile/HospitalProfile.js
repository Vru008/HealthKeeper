import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCatalog } from "../../context/CatalogContext";
import "./providerprofile.css";

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "/Logo/lg6.png";
};

const HospitalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hospitals, loading } = useCatalog();

  if (loading) return <div className="pp-loading">Loading…</div>;

  const h = hospitals.find((x) => x.id === id);
  if (!h) {
    return (
      <div className="pp-loading">
        Hospital not found.{" "}
        <Link to="/department" className="pp-link">
          Browse departments
        </Link>
      </div>
    );
  }

  const book = () =>
    navigate("/form", {
      state: { loc: h.location, speciality: h.specialities[0], name: h.name },
    });

  const stats = [
    { label: "Overall Success Rate", value: `${h.successRate}%`, hi: true },
    { label: "Beds", value: h.beds.total },
    { label: "ICU Beds", value: h.beds.icu },
    { label: "Established", value: h.established },
    { label: "Avg. Wait", value: h.waitingTime },
    { label: "Patient Rating", value: `${h.rating}/5` },
  ];

  const rates = Object.entries(h.specialityRates).sort((a, b) => b[1] - a[1]);

  return (
    <div className="pp-page">
      <div className="pp-wrap">
        <div className="pp-demo" role="note">
          ⓘ <strong>Illustrative demo data.</strong> Hospital details and success
          statistics on this portfolio project are synthetic, not real medical
          information.
        </div>
        <div className="pp-hosp-banner">
          <img src={h.img} alt={h.name} onError={imgFallback} />
          <span className="pp-hosp-rate">★ {h.rating}</span>
        </div>

        <div className="pp-header hosp">
          <div className="pp-id">
            <h1>{h.name}</h1>
            <p className="pp-qual">📍 {h.address}</p>
            <div className="pp-langs">
              <span className="pp-chip">{h.priceTier}</span>
              {h.insurance && <span className="pp-chip">Insurance accepted</span>}
            </div>
            <button className="pp-book" onClick={book}>
              Book Appointment
            </button>
          </div>
        </div>

        <h2 className="pp-section">Hospital Intelligence</h2>
        <div className="pp-stats">
          {stats.map((s) => (
            <div key={s.label} className={`pp-stat ${s.hi ? "pp-stat-hi" : ""}`}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="pp-cols">
          <div className="pp-card">
            <h3>Department Success Rates</h3>
            <div className="pp-rates">
              {rates.map(([sp, rate]) => (
                <div key={sp} className="pp-rate-row">
                  <span>{sp}</span>
                  <div className="pp-bar">
                    <div className="pp-bar-fill" style={{ width: `${rate}%` }} />
                  </div>
                  <strong>{rate}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="pp-card">
            <h3>Facilities</h3>
            <div className="pp-tags">
              {h.facilities.map((f) => (
                <span key={f} className="pp-tag">
                  ✓ {f}
                </span>
              ))}
            </div>
            <h3>Departments</h3>
            <div className="pp-tags">
              {h.specialities.map((s) => (
                <span key={s} className="pp-tag">
                  {s}
                </span>
              ))}
            </div>
            <a
              className="pp-book wide"
              href={h.url}
              target="_blank"
              rel="noreferrer"
              style={{ textAlign: "center", textDecoration: "none" }}
            >
              View on map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;
