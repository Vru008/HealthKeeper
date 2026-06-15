import React from "react";
import "./department.css";
import { useNavigate } from "react-router-dom";
import { specialities } from "../../data/catalog";

// Map each speciality to one of the bundled icons (falls back to a generic one).
const ICONS = {
  Cardiology: "/Icon/heart.png",
  Neurology: "/Icon/neurology.png",
  Oncology: "/Icon/oncology.png",
  Orthopedics: "/Icon/ortho.png",
  Pediatrics: "/Icon/heart1.png",
  Dermatology: "/Icon/pharma.png",
  Gynecology: "/Icon/ivf.png",
  Ophthalmology: "/Icon/general.png",
  ENT: "/Icon/ENT.png",
  Urology: "/Icon/joint.png",
  Nephrology: "/Icon/kidney.png",
  Gastroenterology: "/Icon/liver.png",
  Pulmonology: "/Icon/lung.png",
  Psychiatry: "/Icon/general.png",
  Dentistry: "/Icon/teeth.png",
  "General Medicine": "/Icon/general.png",
};

const Department = () => {
  const navigate = useNavigate();

  const handleClick = (speciality) => {
    navigate("/list", { state: { loc: "", speciality } });
  };

  return (
    <div className="dept-page">
      <div className="dept-head">
        <h1>Our Departments</h1>
        <p>Pick a speciality to find top doctors and hospitals near you.</p>
      </div>

      <div className="dept-grid">
        {specialities.map((sp, i) => (
          <button
            key={sp}
            className="dept-card"
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => handleClick(sp)}
          >
            <div className="dept-icon">
              <img
                src={ICONS[sp] || "/Icon/general.png"}
                alt={sp}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Icon/general.png";
                }}
              />
            </div>
            <h5>{sp}</h5>
            <span className="dept-arrow">Find specialists →</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Department;
