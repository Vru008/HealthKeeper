import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./_header.css";
import { NavLink } from "react-router-dom";

const MainHeader = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
  const [showMediaIcons, setShowMediaIcons] = useState(false);

  return (
    <>
    {/* <div className="container"> */}
      <nav className="main-nav">

        <div className="logo">
          <NavLink className="link" to="/">
            <img src="/Logo/lg6.png" alt="HealthKeeper logo" />
          </NavLink>
        </div>

        <div className="menu-link">
          <ul>
            <li>
              <NavLink className="link" to="/">Home</NavLink>
            </li>
            <li>
              <NavLink className="link" to="/aboutUs">AboutUs</NavLink>
            </li>
            <li>
              <NavLink className="link" to="/department">Department</NavLink>
            </li>
            <li>
              <NavLink className="link" to="/contact">Contact-us</NavLink>
            </li>
          </ul>
        </div>

        <div className="log_in">
          {isAuthenticated && <p> {user.name}</p>}
          {isAuthenticated ? (
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              {" "}
              Log Out
            </button>
          ) : (
            <button onClick={() => loginWithRedirect()}>Log In</button>
          )}
        </div>

        <div className="hamburger-menu">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setShowMediaIcons(!showMediaIcons)}
          >
            <i className="bx bx-menu"></i>
          </button>
          <div
            className={`menu-link mobile-menu-link${
              showMediaIcons ? " active" : ""
            }`}
          >
            <ul>
              <li>
                <NavLink className="link" to="/">Home</NavLink>
              </li>
              <li>
                <NavLink className="link" to="/aboutUs">AboutUs</NavLink>
              </li>
              <li>
                <NavLink className="link" to="/department">Department</NavLink>
              </li>
              <li>
                <NavLink className="link" to="/contact">Contact-us</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* </div> */}
    </>
  );
};

export default MainHeader;
