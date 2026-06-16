import React from "react";
import { specialities } from "../data/lists";

const SpecialityList = (props) => {
  return (
    <select
      className="form-control text-area"
      onChange={(e) => props.handleChange(e)}
      name="speciality"
      defaultValue=""
      required
    >
      <option value="" disabled>
        Choose Speciality
      </option>
      {specialities.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
};
export default SpecialityList;
