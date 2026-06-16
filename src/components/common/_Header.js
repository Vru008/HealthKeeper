import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./_header.css";

const MainHeader = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const links = (
    <ul className="nav-links" onClick={close}>
      <li>
        <NavLink className="link" to="/" end>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink className="link" to="/aboutUs">
          About
        </NavLink>
      </li>
      <li>
        <NavLink className="link" to="/department">
          Departments
        </NavLink>
      </li>
      <li>
        <NavLink className="link ai-link" to="/ai-tools">
          ✨ AI Tools
        </NavLink>
      </li>
      <li>
        <NavLink className="link" to="/contact">
          Contact
        </NavLink>
      </li>
      {user?.role === "patient" && (
        <li>
          <NavLink className="link" to="/appointments">
            My Appointments
          </NavLink>
        </li>
      )}
      {user?.role === "doctor" && (
        <li>
          <NavLink className="link" to="/doctor">
            Dashboard
          </NavLink>
        </li>
      )}
      {user?.role === "hospital" && (
        <li>
          <NavLink className="link" to="/hospital">
            Dashboard
          </NavLink>
        </li>
      )}
      {user?.role === "admin" && (
        <li>
          <NavLink className="link" to="/admin">
            Admin
          </NavLink>
        </li>
      )}
    </ul>
  );

  return (
    <nav className="main-nav">
      <div className="logo">
        <Link to="/" onClick={close}>
          <img src="/Logo/lg6.png" alt="HealthKeeper" />
        </Link>
      </div>

      <div className={`nav-center ${open ? "open" : ""}`}>{links}</div>

      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-hi">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn-ghost" onClick={logout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link className="btn-ghost" to="/login">
              Log In
            </Link>
            <Link className="btn-primary" to="/register">
              Sign Up
            </Link>
          </>
        )}
      </div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="bx bx-menu"></i>
      </button>
    </nav>
  );
};

export default MainHeader;
