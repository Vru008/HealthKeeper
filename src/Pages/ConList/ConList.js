import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hospitals as ALL_HOSPITALS, doctors as ALL_DOCTORS } from "../../data/catalog";
import "./conlist.css";

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "/Logo/lg6.png";
};

const Stars = ({ rating }) => (
  <span className="cl-stars">
    ★ {rating}
  </span>
);

const ConList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loc, speciality } = location.state || {};

  const hospitalList = useMemo(
    () =>
      ALL_HOSPITALS.filter(
        (h) =>
          h.specialities.includes(speciality) && (!loc || h.location === loc)
      ),
    [loc, speciality]
  );

  const doctorList = useMemo(
    () =>
      ALL_DOCTORS.filter(
        (d) => d.speciality === speciality && (!loc || d.location === loc)
      ),
    [loc, speciality]
  );

  if (!speciality) {
    // No selection — guide the user back.
    return (
      <div className="cl-empty-page">
        <h2>Start a search</h2>
        <p>Choose a speciality and city, or pick a department.</p>
        <button className="cl-btn" onClick={() => navigate("/department")}>
          Browse Departments
        </button>
      </div>
    );
  }

  const book = (provider) =>
    navigate("/form", {
      state: {
        loc: provider.location,
        speciality: provider.speciality || speciality,
        name: provider.name,
      },
    });

  return (
    <div className="cl-page">
      <header className="cl-hero">
        <h1>
          {speciality} specialists &amp; hospitals
          {loc ? ` in ${loc}` : ""}
        </h1>
        <p>
          {doctorList.length} doctors · {hospitalList.length} hospitals
          {loc ? ` in ${loc}` : " across India"}. Compare, then book in seconds.
        </p>
      </header>

      {/* Doctors */}
      <section className="cl-section">
        <h2 className="cl-section-title">Top Doctors</h2>
        <div className="cl-grid">
          {doctorList.map((d) => (
            <article className="doc-card" key={d.id}>
              <img
                className="doc-photo"
                src={d.img}
                alt={d.name}
                loading="lazy"
                onError={imgFallback}
              />
              <div className="doc-body">
                <div className="doc-top">
                  <h3>{d.name}</h3>
                  <Stars rating={d.rating} />
                </div>
                <p className="doc-spec">{d.speciality}</p>
                <p className="doc-qual">{d.qualifications}</p>
                <div className="doc-meta">
                  <span>{d.experience} yrs exp</span>
                  <span>·</span>
                  <span>₹{d.fee} fee</span>
                  <span>·</span>
                  <span>{d.location}</span>
                </div>
                <div className="doc-tags">
                  {d.focus.map((f) => (
                    <span key={f} className="doc-tag">
                      {f}
                    </span>
                  ))}
                </div>
                <button className="cl-btn cl-btn-block" onClick={() => book(d)}>
                  Book Appointment
                </button>
              </div>
            </article>
          ))}
          {doctorList.length === 0 && (
            <p className="cl-none">No doctors found for this selection.</p>
          )}
        </div>
      </section>

      {/* Hospitals */}
      <section className="cl-section">
        <h2 className="cl-section-title">Hospitals</h2>
        <div className="cl-grid cl-grid-wide">
          {hospitalList.map((h) => (
            <article className="hosp-card" key={h.id}>
              <div className="hosp-imgwrap">
                <img
                  src={h.img}
                  alt={h.name}
                  loading="lazy"
                  onError={imgFallback}
                />
                <span className="hosp-rating">★ {h.rating}</span>
              </div>
              <div className="hosp-body">
                <h3>{h.name}</h3>
                <p className="hosp-addr">📍 {h.address}</p>
                <div className="hosp-tags">
                  {h.specialities.slice(0, 4).map((s) => (
                    <span key={s} className="hosp-tag">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="hosp-fac">
                  {h.facilities.slice(0, 4).map((f) => (
                    <span key={f}>✓ {f}</span>
                  ))}
                </div>
                <div className="hosp-actions">
                  <button
                    className="cl-btn"
                    onClick={() => book({ ...h, speciality })}
                  >
                    Book Appointment
                  </button>
                  <a
                    className="cl-btn cl-btn-ghost"
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on map
                  </a>
                </div>
              </div>
            </article>
          ))}
          {hospitalList.length === 0 && (
            <p className="cl-none">No hospitals found for this selection.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConList;
