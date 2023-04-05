import { Link } from "react-router-dom";
import './header.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import React from 'react'

const Header = () => {
  return (

    <div className="row header">
      <div className="col-md-3">
        <img src ="/image/logo.jpg" href="/Home" alt="about"/>
      </div>
      <div class="col-md-9 navbar text-decoration-none " >
        <strong><Link to="/Home" className="text-decoration-none">Home</Link></strong>
        <strong><Link to="/AboutUs" className="text-decoration-none">AboutUs</Link></strong>
        <strong><Link to="/Hospital" className="text-decoration-none">Hospital</Link></strong>
        <strong><Link to="/Doctor" className="text-decoration-none">Doctor</Link></strong>
        <strong><Link to="/Department" className="text-decoration-none">Department</Link></strong>
        <strong><Link to="/Contact" className="text-decoration-none">Contact</Link></strong>
      </div>
    </div>
  )
}

export default Header;
