import React from "react";
import { locations } from "../data/lists";

const LocationList = (props) => {
  return (
    <div className="">
      <select
        className="form-control text-area"
        name="location"
        defaultValue=""
        onChange={(e) => props.handleChange(e)}
      >
        <option value="" disabled>
          Choose City
        </option>
        {locations.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};
export default LocationList;
