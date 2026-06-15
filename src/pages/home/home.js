import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  specialities,
  locations,
  doctors,
  hospitals,
} from "../../data/catalog";
import "./home.css";

const STEPS = [
  {
    n: "1",
    t: "Search",
    d: "Pick a speciality and city, or describe symptoms to our AI assistant.",
  },
  {
    n: "2",
    t: "Compare",
    d: "Browse verified doctors and hospitals by rating, experience, and fee.",
  },
  {
    n: "3",
    t: "Book & relax",
    d: "Confirm in seconds and get a calendar reminder straight to your device.",
  },
];

const FEATURES = [
  { icon: "🔍", t: "Smart search & filters", d: "Find the right specialist by rating, experience, fee, and city." },
  { icon: "📅", t: "Instant reminders", d: "Every booking adds a calendar event with an alarm — never miss a visit." },
  { icon: "🤖", t: "AI health assistant", d: "Not sure which doctor to see? Ask our assistant any time." },
  { icon: "🔒", t: "Secure accounts", d: "Your bookings and details are protected with encrypted logins." },
];

const Home = () => {
  const navigate = useNavigate();
  const [speciality, setSpeciality] = useState(specialities[0]);
  const [city, setCity] = useState("");

  const search = () =>
    navigate("/list", { state: { loc: city, speciality } });

  const topDoctors = [...doctors]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 4);

  const topHospitals = [...hospitals]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 4);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">🩺 Trusted healthcare, simplified</span>
          <h1 className="hero-title">
            Find the right doctor,
            <br />
            <span>book in seconds.</span>
          </h1>
          <p className="hero-sub">
            Search {doctors.length}+ verified doctors and {hospitals.length}+
            hospitals across {locations.length} cities — compare, book, and get
            instant reminders.
          </p>

          <div className="hero-search">
            <div className="hs-field">
              <label>Speciality</label>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
              >
                {specialities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="hs-field">
              <label>City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All cities</option>
                {locations.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button className="hs-btn" onClick={search}>
              Search
            </button>
          </div>

          <div className="hero-trust">
            ⭐ Top-rated specialists · ⏰ Calendar reminders · 🤖 AI assistant
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <strong>{doctors.length}+</strong>
          <span>Verified Doctors</span>
        </div>
        <div className="stat">
          <strong>{hospitals.length}+</strong>
          <span>Hospitals</span>
        </div>
        <div className="stat">
          <strong>{locations.length}</strong>
          <span>Cities</span>
        </div>
        <div className="stat">
          <strong>{specialities.length}</strong>
          <span>Specialities</span>
        </div>
      </section>

      {/* FEATURED HOSPITALS */}
      <section className="home-section">
        <div className="sec-head">
          <h2>Featured hospitals</h2>
          <p>Top-rated multi-speciality hospitals on HealthKeeper.</p>
        </div>
        <div className="hosp-showcase">
          {topHospitals.map((h) => (
            <div
              key={h.id}
              className="hsc-card"
              onClick={() =>
                navigate("/list", {
                  state: { loc: h.location, speciality: h.specialities[0] },
                })
              }
            >
              <div className="hsc-img">
                <img
                  src={h.img}
                  alt={h.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/Logo/lg6.png";
                  }}
                />
                <span className="hsc-rating">★ {h.rating}</span>
              </div>
              <div className="hsc-body">
                <h4>{h.name}</h4>
                <p className="hsc-city">📍 {h.location}</p>
                <p className="hsc-meta">
                  {h.specialities.length} specialities · {h.facilities.length}{" "}
                  facilities
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP DOCTORS */}
      <section className="home-section alt">
        <div className="sec-head">
          <h2>Top-rated doctors</h2>
          <p>Some of the highest-rated specialists on HealthKeeper.</p>
        </div>
        <div className="top-doctors">
          {topDoctors.map((d) => (
            <div
              key={d.id}
              className="td-card"
              onClick={() =>
                navigate("/list", {
                  state: { loc: d.location, speciality: d.speciality },
                })
              }
            >
              <img
                src={d.img}
                alt={d.name}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Logo/lg6.png";
                }}
              />
              <h4>{d.name}</h4>
              <p className="td-spec">{d.speciality}</p>
              <p className="td-meta">
                ⭐ {d.rating} · {d.experience} yrs · {d.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section">
        <div className="sec-head">
          <h2>How it works</h2>
          <p>From symptom to appointment in three simple steps.</p>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section alt">
        <div className="sec-head">
          <h2>Why HealthKeeper</h2>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.t} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h4>{f.t}</h4>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to feel better?</h2>
        <p>Book your next appointment with a top specialist today.</p>
        <div className="cta-actions">
          <Link to="/department" className="cta-btn">
            Find a Doctor
          </Link>
          <Link to="/register" className="cta-btn cta-ghost">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
