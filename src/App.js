import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Pages/home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Form from "./components/common/Form";
import Department from "./Pages/Department/Department";
import Footer from "./components/common/Footer";
import Contact from "./Pages/Contact/Contact";
import MainHeader from "./components/common/_Header";
import ConList from "./Pages/ConList/ConList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <>
      <BrowserRouter>
        <MainHeader />
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
    </>
  );
}

export default App;
