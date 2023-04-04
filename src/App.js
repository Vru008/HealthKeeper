import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import AboutUs from "./Pages/AboutUs/AboutUs";
import "./Pages/AboutUs/aboutUs.css";
import Department from "./Pages/Department/Department";
import "./Pages/Department/department.css";
import Home from "./Pages/Home/Home";
import Doctor from "./Pages/Doctor/Doctor";
import "./Pages/Doctor/doctor.css";
import Hospital from "./Pages/Hospital/Hosp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";


function App() {
  return (
    <>
      <Header />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="AboutUs" element={<AboutUs />} />
          <Route path="Hospital" element={<Hospital />} />
          <Route path="Doctor" element={<Doctor />} />
          <Route path="Department" element={<Department />} />
          
          
      </Routes>
    
      {/* <Home/>
      <AboutUs />
      <Department />
      <Doctor /> 
      <Header /> */}
    </>
  );
}

export default App;
