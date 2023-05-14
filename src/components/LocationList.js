import React, { useState, useEffect } from "react";
import axios from "axios";

const LocationList = (props) => {
  const [data, setData] = useState([]);

  const getHospitalData = () => {
    axios.get("http://localhost:3004/hospitals").then((result) => {
      console.log("here's the data", result.data);
      const specilalityArr = result.data.map((item, index) => {
        return item.location;
      });
      console.log("console_data", [...new Set(specilalityArr)]);
      setData([...new Set(specilalityArr)]);
    });
  };

  useEffect(() => {
    getHospitalData();
  }, []);

  return (
    <div className="">
      <select
        className="form-control text-area"
        name="location"
        onChange={(e) => props.handleChange(e)}

        // id="exampleFormControlSelect1"
      >
        <option>Choose City </option>
        {data &&
          data?.map((item, index) => {
            return <option>{item}</option>;
          })}
      </select>
    </div>
  );
};
export default LocationList;