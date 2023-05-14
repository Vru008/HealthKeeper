import React, { useState, useEffect } from "react";
import './form.css'

function Drop_Down() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3004/hospitals")
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <select className='_box'>
        <option>Hospital</option>
      {data.map((item, index) => (
        <option key={index} value={item.name}>{item.name}</option>
      ))}
    </select>
  );
}

export default Drop_Down