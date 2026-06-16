import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { locations as ALL_CITIES } from "../../data/lists";
import { useCatalog } from "../../context/CatalogContext";
import "./conlist.css";

const imgFallback = (e) => {
  e.target.onerror = null;
  e.target.src = "/Logo/lg6.png";
};

const PAGE = 9;

const ConList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctors: ALL_DOCTORS, hospitals: ALL_HOSPITALS, loading } =
    useCatalog();
  const { loc, speciality } = location.state || {};

  // Filter state
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(loc || "");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [docLimit, setDocLimit] = useState(PAGE);
  const [hospLimit, setHospLimit] = useState(PAGE);

  const baseDoctors = useMemo(
    () => ALL_DOCTORS.filter((d) => d.speciality === speciality),
    [ALL_DOCTORS, speciality]
  );
  const baseHospitals = useMemo(
    () => ALL_HOSPITALS.filter((h) => h.specialities.includes(speciality)),
    [ALL_HOSPITALS, speciality]
  );

  const common = (x) =>
    (!query || x.name.toLowerCase().includes(query.toLowerCase())) &&
    (!city || x.location === city) &&
    x.rating >= minRating;

  const doctorList = useMemo(() => {
    const list = baseDoctors.filter(common);
    const sorters = {
      rating: (a, b) => b.rating - a.rating,
      experience: (a, b) => b.experience - a.experience,
      feeLow: (a, b) => a.fee - b.fee,
      feeHigh: (a, b) => b.fee - a.fee,
    };
    return [...list].sort(sorters[sort] || sorters.rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDoctors, query, city, minRating, sort]);

  const hospitalList = useMemo(() => {
    const list = baseHospitals.filter(common);
    return [...list].sort((a, b) =>
      sort === "feeLow" || sort === "feeHigh"
        ? b.reviews - a.reviews
        : b.rating - a.rating
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseHospitals, query, city, minRating, sort]);

  // Reset how many are shown whenever the result set changes.
  useEffect(() => {
    setDocLimit(PAGE);
    setHospLimit(PAGE);
  }, [speciality, query, city, minRating, sort]);

  if (!speciality) {
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

  const resetFilters = () => {
    setQuery("");
    setCity(loc || "");
    setMinRating(0);
    setSort("rating");
  };

  return (
    <div className="cl-page">
      <header className="cl-hero">
        <h1>
          {speciality} specialists &amp; hospitals
          {city ? ` in ${city}` : ""}
        </h1>
        <p>
          {doctorList.length} doctors · {hospitalList.length} hospitals
          {city ? ` in ${city}` : " across India"}. Filter and sort to find your fit.
        </p>
      </header>

      {/* Filter bar */}
      <div className="cl-filters">
        <input
          className="cl-search"
          type="text"
          placeholder="🔍 Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {ALL_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value={0}>Any rating</option>
          <option value={4}>4.0+ ★</option>
          <option value={4.5}>4.5+ ★</option>
          <option value={4.7}>4.7+ ★</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Top rated</option>
          <option value="experience">Most experienced</option>
          <option value="feeLow">Fee: low to high</option>
          <option value="feeHigh">Fee: high to low</option>
        </select>
        <button className="cl-reset" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {/* Doctors */}
      <section className="cl-section">
        <h2 className="cl-section-title">Top Doctors ({doctorList.length})</h2>
        <div className="cl-grid">
          {doctorList.slice(0, docLimit).map((d) => (
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
                  <span className="cl-stars">★ {d.rating}</span>
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
          {loading && <p className="cl-none">Loading doctors…</p>}
          {!loading && doctorList.length === 0 && (
            <p className="cl-none">No doctors match your filters.</p>
          )}
        </div>
        {doctorList.length > docLimit && (
          <div className="cl-more">
            <button
              className="cl-btn cl-btn-ghost"
              onClick={() => setDocLimit((n) => n + PAGE)}
            >
              Show more doctors ({doctorList.length - docLimit} more)
            </button>
          </div>
        )}
      </section>

      {/* Hospitals */}
      <section className="cl-section">
        <h2 className="cl-section-title">Hospitals ({hospitalList.length})</h2>
        <div className="cl-grid cl-grid-wide">
          {hospitalList.slice(0, hospLimit).map((h) => (
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
          {loading && <p className="cl-none">Loading hospitals…</p>}
          {!loading && hospitalList.length === 0 && (
            <p className="cl-none">No hospitals match your filters.</p>
          )}
        </div>
        {hospitalList.length > hospLimit && (
          <div className="cl-more">
            <button
              className="cl-btn cl-btn-ghost"
              onClick={() => setHospLimit((n) => n + PAGE)}
            >
              Show more hospitals ({hospitalList.length - hospLimit} more)
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ConList;
