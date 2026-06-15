import React, { useState, useEffect } from "react";
import api from "../api";

const LocationList = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/data/locations")
      .then((res) => setData(res.data))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="">
      <select
        className="form-control text-area"
        name="location"
        onChange={(e) => props.handleChange(e)}
      >
        <option>Choose City</option>
        {data.map((item, index) => (
          <option key={index}>{item}</option>
        ))}
      </select>
    </div>
  );
};
export default LocationList;
