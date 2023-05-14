import React, { useState, useEffect } from "react";
import Diseases from "./Diseases";
// import './city_diseases.css';
import './form.css';

const City = () => {
    const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3004/hospitals")
      .then(response => response.json())
    .then(data => {
        // Filter out duplicate names
        const uniqueData = data.filter((item, index, self) =>
          index === self.findIndex(t => t.location === item.location)
        );
        setData(uniqueData);
      });
  }, []);
  return (
    <div>
      <select className='Dropdown'>
        <option>City</option>
      {data.map((item, index) => (
        <option key={index} value={item.location}>{item.location}</option>
      ))}
    </select>
    </div>
  )
}


export default City
