import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./_header.css";
import { NavLink } from "react-router-dom";

const _Header = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
  const [showMediaIcons, setShowMediaIcons] = useState(false);

  return (
    <>
    {/* <div className="container"> */}
      <nav className="main-nav">

        <div className="logo">
          <NavLink class="link" to="/">
            <img src="/Logo/lg6.png"></img>
          </NavLink>
        </div>

        <div className="menu-link">
          <ul>
            <li>
              <NavLink class="link" to="/">Home</NavLink>
            </li>
            <li>
              <NavLink class="link" to="/aboutUs">AboutUs</NavLink>
            </li>
              {/* <li>
                <NavLink class="link" to="/doctor">Doctor</NavLink>
              </li> */}
            <li>
              <NavLink class="link" to="/department">Department</NavLink>
            </li>
            <li>
              <NavLink class="link" to="/contact">Contactus</NavLink>
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
          {console.log("login", isAuthenticated)}
        </div>

        <div className="hamburger-menu">
          <a href="#" onClick={() => setShowMediaIcons(!showMediaIcons)}>
            <i class="bx bx-menu"></i>
          </a>
          <div className="menu-link mobile-menu-link">
            <ul>
              <li>
                <NavLink class="link" to="/">Home</NavLink>
              </li>
              <li>
                <NavLink class="link" to="/aboutUs">AboutUs</NavLink>
              </li>
              <li>
                <NavLink class="link" to="/doctor">Doctor</NavLink>
              </li>
              <li>
                <NavLink class="link" to="/department">Department</NavLink>
              </li>
              <li>
                <NavLink class="link" to="/contactus">Contactus</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* </div> */}
    </>
  );
};

export default _Header;
