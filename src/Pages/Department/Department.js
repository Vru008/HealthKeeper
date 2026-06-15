import React from "react";
import "./department.css";
import { useNavigate } from "react-router-dom";

const departments = [
  { icon: "/Icon/cancer.png", label: "Oncology", speciality: "Oncology" },
  { icon: "/Icon/heart.png", label: "Cardiology", speciality: "Cardiology" },
  { icon: "/Icon/kidney.png", label: "Neurology", speciality: "Neurology" },
  { icon: "/Icon/teeth.png", label: "Gynecology", speciality: "Gynecology" },
  { icon: "/Icon/ivf.png", label: "Ophthalmology", speciality: "Ophthalmology" },
  { icon: "/Icon/neurology.png", label: "Nephrology", speciality: "nephrology" },
  { icon: "/Icon/ENT.png", label: "Urology", speciality: "urology" },
  { icon: "/Icon/joint.png", label: "Dietician", speciality: "Dietician" },
  { icon: "/Icon/liver.png", label: "Liver", speciality: "Liver" },
];

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
        {departments.map((d, i) => (
          <button
            key={d.label}
            className="dept-card"
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => handleClick(d.speciality)}
          >
            <div className="dept-icon">
              <img src={d.icon} alt={d.label} />
            </div>
            <h5>{d.label}</h5>
            <span className="dept-arrow">Find specialists →</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Department;
