import { Link } from "react-router-dom";
import './header.css';
import { useAuth0 } from "@auth0/auth0-react";
// import 'bootstrap/dist/css/bootstrap.min.css'; 
import React from 'react'


const Header = () => {
  const { loginWithRedirect,isAuthenticated,logout,user } = useAuth0();
  return (
    <div className="row header">
      <div className="col-md-6">

      {/* <input type="checkbox" id="check" />
        <label for="check" className="checkbtn">
          <i class='bx bx-menu'></i>
        </label> */}

      <Link to="/">
      <img src ="/Logo/logo.jpg"alt="about"/>
      </Link>
      </div>
      <div class="col-md-6 d-flex navbar _text-decoration-none " >

      <input type="checkbox" id="check" />
        {/* <label for="check" className="checkbtn">
          <i class='bx bx-menu'></i>
        </label> */}
        
        <strong><Link to="/" className="text-decoration-none">Home</Link></strong>
        <strong><Link to="/aboutUs" className="text-decoration-none">AboutUs</Link></strong>
        <strong><Link to="/doctor" className="text-decoration-none">Doctor</Link></strong>
        <strong><Link to="/department" className="text-decoration-none">Department</Link></strong>
        {/* <strong><Link to="/hospital" className="text-decoration-none">Hospital</Link></strong> */}
        <strong><Link to="/contact" className="text-decoration-none">Contactus</Link></strong>
        {
          isAuthenticated && <p> {user.name}</p>
        }
    {
      isAuthenticated ?(
      <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>  Log Out
    </button>
       ) : (
    <button onClick={() => loginWithRedirect()}>Log In</button>
    )}
{console.log("login", isAuthenticated)}

        {/* <input type="checkbox" id="check" />
        <label for="check" className="checkbtn">
          <i class='bx bx-menu'></i>
        </label> */}

      </div>
    </div>
  )
}

export default Header;
