import React, { useEffect } from "react";
import "./department.css";
import {  useNavigate } from "react-router-dom";
import { useState } from "react";

const Department = () => {
  
  const navigate = useNavigate();

  const [department, setDepartment] = useState()

  const handleClick = (item) => {
    console.log("console_123",item);
    setDepartment(item)
    navigate("/list", {
      state: {
        loc: "",
        speciality: item,
      },
    });
  }

  console.log("cocole_department",department);

  useEffect(() => {
    // handleClick()
  },[])

  return (
    <div className="containerr">
      {/* <div className='department depa1'>
          <img src='/image/bghd.jpg'/>
          </div> */}
      <div className="department depa2">
        <img src="/Icon/cancer.png" />
        <h5 onClick={(e) => handleClick("Oncology")}>Oncology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/heart.png" />
        <h5 onClick={(e) => handleClick("Cardiology")}>Cardiology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/kidney.png" />
        <h5 onClick={(e) => handleClick("Neurology")}>Neurology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/teeth.png" />
        <h5 onClick={(e) => handleClick("Gynecology")}>Gynecology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/ivf.png" />
        <h5 onClick={(e) => handleClick("Ophthalmology")}>Ophthalmology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/neurology.png" />
        <h5 onClick={(e) => handleClick("nephrology")}>nephrology</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/ENT.png" />
        <h5 onClick={(e) => handleClick("urology")}>urology </h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/joint.png" />
        <h5 onClick={(e) => handleClick("Dietician")}>Dietician</h5>
      </div>
      <div className="department depa2">
        <img src="/Icon/liver.png" />
        <h5 onClick={(e) => handleClick("Liver")}>Liver</h5>
      </div>
    </div>
  );
};

export default Department;