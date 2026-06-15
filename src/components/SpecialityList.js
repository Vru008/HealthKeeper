import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";

const SpecialityList = (props) => {
  const [data, setData] = useState([]);

  const getSpecialities = () => {
    axios.get(`${API_BASE}/doctors`).then((result) => {
      const specialityArr = result.data.map((item) => item.speciality);
      setData([...new Set(specialityArr)]);
    });
  };

  useEffect(() => {
    getSpecialities();
  }, []);

  return (
    <select
      className="form-control text-area"
      onChange={(e) => props.handleChange(e)}
      name="speciality"
      required
    >
      <option>Choose Disease</option>
      {data &&
        data?.map((item, index) => {
          return <option key={index}>{item}</option>;
        })}
    </select>
  );
};
export default SpecialityList;
