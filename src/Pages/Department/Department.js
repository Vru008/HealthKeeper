import React from "react";
import "./department.css";
import { useNavigate } from "react-router-dom";

const Department = () => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    navigate("/list", {
      state: {
        loc: "",
        speciality: item,
      },
    });
  };

  return (
    <div className="containerr">
      {/* <div className='department depa1'>
          <img src='/image/bghd.jpg'/>
          </div> */}
      <div className="department depa2">
        <img src="/Icon/cancer.png" alt="Oncology" />
        <h5 onClick={(e) => handleClick("Oncology")}>Oncology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/heart.png" alt="Cardiology" />
        <h5 onClick={(e) => handleClick("Cardiology")}>Cardiology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/kidney.png" alt="Neurology" />
        <h5 onClick={(e) => handleClick("Neurology")}>Neurology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/teeth.png" alt="Gynecology" />
        <h5 onClick={(e) => handleClick("Gynecology")}>Gynecology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/ivf.png" alt="Ophthalmology" />
        <h5 onClick={(e) => handleClick("Ophthalmology")}>Ophthalmology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/neurology.png" alt="Nephrology" />
        <h5 onClick={(e) => handleClick("nephrology")}>nephrology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/ENT.png" alt="Urology" />
        <h5 onClick={(e) => handleClick("urology")}>urology </h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/joint.png" alt="Dietician" />
        <h5 onClick={(e) => handleClick("Dietician")}>Dietician</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/liver.png" alt="Liver" />
        <h5 onClick={(e) => handleClick("Liver")}>Liver</h5>
      </div>
    </div>
  );
};

export default Department;