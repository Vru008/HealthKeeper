import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./_header.css";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

// The role-specific destination shown in menus.
const roleLink = (role) => {
  if (role === "doctor") return { to: "/doctor", label: "Dashboard" };
  if (role === "hospital") return { to: "/hospital", label: "Dashboard" };
  if (role === "admin") return { to: "/admin", label: "Admin" };
  return { to: "/appointments", label: "My Appointments" };
};

const MainHeader = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile menu
  const [menu, setMenu] = useState(false); // profile dropdown
  const menuRef = useRef(null);

  const close = () => setOpen(false);
  const closeMenu = () => setMenu(false);

  // Close the profile dropdown on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const rl = user ? roleLink(user.role) : null;

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
      {user && (
        <li>
          <NavLink className="link" to={rl.to}>
            {rl.label}
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

      <div className={`nav-center ${open ? "open" : ""}`}>
        {links}
        {/* Mobile auth block (inside the hamburger menu) */}
        <div className="nav-auth-mobile" onClick={close}>
          {user ? (
            <>
              <NavLink className="btn-ghost" to="/profile">
                Profile
              </NavLink>
              <NavLink className="btn-ghost" to="/settings">
                Settings
              </NavLink>
              <button className="btn-primary" onClick={logout}>
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
      </div>

      {/* Desktop auth area */}
      <div className="nav-auth">
        {user ? (
          <div className="profile-menu" ref={menuRef}>
            <button
              className="profile-trigger"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
            >
              <span className={`profile-avatar av-${user.role}`}>
                {initials(user.name)}
              </span>
              <span className="profile-name">{user.name.split(" ")[0]}</span>
              <span className={`profile-chev ${menu ? "up" : ""}`}>▾</span>
            </button>

            {menu && (
              <div className="profile-dropdown" onClick={closeMenu}>
                <div className="pd-head">
                  <span className={`profile-avatar av-${user.role}`}>
                    {initials(user.name)}
                  </span>
                  <div className="pd-id">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className={`pill pill-role-${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <NavLink className="pd-item" to="/profile">
                  👤 Profile
                </NavLink>
                <NavLink className="pd-item" to="/settings">
                  ⚙️ Settings
                </NavLink>
                <NavLink className="pd-item" to={rl.to}>
                  📋 {rl.label}
                </NavLink>
                <div className="pd-divider" />
                <button className="pd-item pd-logout" onClick={logout}>
                  ⎋ Log Out
                </button>
              </div>
            )}
          </div>
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
