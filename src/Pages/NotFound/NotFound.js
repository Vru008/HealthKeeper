import React from "react";
import { Link } from "react-router-dom";
import "./notfound.css";

const NotFound = () => (
  <div className="nf-page">
    <div className="nf-code">404</div>
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or has moved.</p>
    <div className="nf-actions">
      <Link to="/" className="nf-btn">
        Go Home
      </Link>
      <Link to="/department" className="nf-btn nf-ghost">
        Find a Doctor
      </Link>
    </div>
  </div>
);

export default NotFound;
