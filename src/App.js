import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Department from "./Pages/Department/Department";
import Contact from "./Pages/Contact/Contact";
import ConList from "./Pages/ConList/ConList";
import AITools from "./Pages/AITools/AITools";
import NotFound from "./Pages/NotFound/NotFound";
import Appointments from "./Pages/Appointments/Appointments";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ProviderDashboard from "./Pages/Dashboard/ProviderDashboard";
import AdminDashboard from "./Pages/Dashboard/AdminDashboard";
import Profile from "./Pages/Account/Profile";
import Settings from "./Pages/Account/Settings";
import Form from "./components/common/Form";
import MainHeader from "./components/common/_Header";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import AIChat from "./components/AIChat";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
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
        <Route
          path="/ai-tools"
          element={
            <ProtectedRoute>
              <AITools />
            </ProtectedRoute>
          }
        />
        <Route path="/appointments" element={<Appointments />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital"
          element={
            <ProtectedRoute roles={["hospital"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIChat />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
