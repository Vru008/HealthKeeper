import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import AboutUs from "./Pages/AboutUs/AboutUs";
import "./Pages/AboutUs/aboutUs.css";
import Department from "./Pages/Department/Department";
import "./Pages/Department/department.css";
import Home from "./Pages/Home/Home";
import Doctor from "./Pages/Doctor/Doctor";
import "./Pages/Doctor/doctor.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>
      {/* <Routes>
          <Route index element={<Home />} />
          <Route path="AboutUs" element={<AboutUs />} />
          <Route path="contact" element={<contact />} />
          <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter> */}
      {/* <Home/>
      <AboutUs />
      <Department />
      <Doctor /> */}
    </>
  );
}

export default App;
