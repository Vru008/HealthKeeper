import React, { useState, useEffect } from "react";
import api from "../api";

const SpecialityList = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/data/specialities")
      .then((res) => setData(res.data))
      .catch(() => setData([]));
  }, []);

  return (
    <select
      className="form-control text-area"
      onChange={(e) => props.handleChange(e)}
      name="speciality"
      required
    >
      <option>Choose Disease</option>
      {data.map((item, index) => (
        <option key={index}>{item}</option>
      ))}
    </select>
  );
};
export default SpecialityList;
