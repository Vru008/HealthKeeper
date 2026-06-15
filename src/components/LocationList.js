import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";

const LocationList = (props) => {
  const [data, setData] = useState([]);

  const getLocations = () => {
    axios.get(`${API_BASE}/hospitals`).then((result) => {
      const locationArr = result.data.map((item) => item.location);
      setData([...new Set(locationArr)]);
    });
  };

  useEffect(() => {
    getLocations();
  }, []);

  return (
    <div className="">
      <select
        className="form-control text-area"
        name="location"
        onChange={(e) => props.handleChange(e)}
      >
        <option>Choose City</option>
        {data &&
          data?.map((item, index) => {
            return <option key={index}>{item}</option>;
          })}
      </select>
    </div>
  );
};
export default LocationList;
