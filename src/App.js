import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import AboutUs from "./Pages/AboutUs/AboutUs";
import "./Pages/AboutUs/aboutUs.css";
import Department from "./Pages/Department/Department";
import "./Pages/Department/department.css";
import Home from "./Pages/home/Home";
import Doctor from "./Pages/Doctor/Doctor";
import "./Pages/Doctor/doctor.css";

function App() {
  return (
    <>
      <Home/>
      <AboutUs />
      <Department />
      <Doctor />
    </>
  );
}

export default App;
