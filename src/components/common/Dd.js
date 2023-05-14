import React, { useState, useEffect } from "react";
import './city_diseases.css';
import './form.css'

const Dd = () => {

    const [data, setData] = useState([]);

    useEffect(() => {
      fetch("http://localhost:3004/hospitals")
        .then(response => response.json())
      .then(data => {
          // Filter out duplicate names
          const uniqueData = data.filter((item, index, self) =>
            index === self.findIndex(t => t.speciality === item.speciality)
          );
          setData(uniqueData);
        });
    }, []);

    // const [data, setData] = useState([]);

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
        <option>Diseases</option>
      {data.map((item, index) => (
        <option key={index} value={item.speciality}>{item.speciality}</option>
      ))}
    </select>

    <select className='Dropdown'>
        <option>City</option>
      {data.map((item, index) => (
        <option key={index} value={item.location}>{item.location}</option>
      ))}
    </select>
    </div>
  )
}

export default Dd
