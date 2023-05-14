import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/common/Header";
import Home from "./Pages/home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Form from "./components/common/Form";
import Department from "./Pages/Department/Department";
import Footer from "./components/common/Footer";
import Contact from "./Pages/Contact/Contact";
// import Diseases from "./components/common/Diseases";
// import Login from "./components/common/Login";
// import Dropdown from './components/common/Dropdown'
// import Drop_Down from "./components/common/Drop_Down";
// import Dd from "./components/common/Dd";
import _Header from "./components/common/_Header";
import ConList from "./Pages/ConList/ConList";
// import ScrollToTop from "./components/common/ScrollToTop";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ScrollToTop from "./components/common/ScrollToTop";
import Service from "./components/common/Service";
import axios from "axios";

function App() {
  const [mydata, setData] = useState();
  const getapi = () => {
    axios.get("http://localhost:3004/doctors").then((result) => {
      console.log(result);
      setData(result.data);
    });
  };
  useEffect(() => {
    console.log("how r you");
    getapi();
  }, []);

  return (
    <>
      <BrowserRouter>
        <_Header />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/department" element={<Department />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/form" element={<Form />} />
          <Route path="/list" element={<ConList />} />
        </Routes>
        <Footer />
      </BrowserRouter>

      {/* <Service /> */}

      {/* <_Header />  */}
    </>
  );
}

export default App;
