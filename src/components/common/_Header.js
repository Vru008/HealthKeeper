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
      {user && (
        <li>
          <NavLink className="link ai-link" to="/ai-tools">
            ✨ AI Tools
          </NavLink>
        </li>
      )}
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

  const authButtons = user ? (
    <>
      <span className="nav-hi">Hi, {user.name.split(" ")[0]}</span>
      <button
        className="btn-ghost"
        onClick={() => {
          logout();
          close();
        }}
      >
        Log Out
      </button>
    </>
  ) : (
    <>
      <Link className="btn-ghost" to="/login" onClick={close}>
        Log In
      </Link>
      <Link className="btn-primary" to="/register" onClick={close}>
        Sign Up
      </Link>
    </>
  );

  return (
    <nav className="main-nav">
      <div className="logo">
        <Link to="/" onClick={close}>
          <img src="/Logo/lg6.png" alt="HealthKeeper" />
        </Link>
      </div>

      <div className={`nav-center ${open ? "open" : ""}`}>
        {links}
        <div className="nav-auth-mobile">{authButtons}</div>
      </div>

      <div className="nav-auth">{authButtons}</div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
    </nav>
  );
};

export default MainHeader;
