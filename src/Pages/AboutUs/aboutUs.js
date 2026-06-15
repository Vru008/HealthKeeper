import React from "react";
import "./aboutUs.css";


const AboutUs = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="bgb col-7 col-md-12">
          <img src="/abt img/dbg2.jpg" alt="" />
          <p>
            <strong>
              Happiness begins <br />
              with good health
            </strong>
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-4 p-2 box1">
          <p className="head">
            <strong>Mission </strong>
          </p>
          <p className="par">
            To fix the broken patient journey by offering full-stack healthcare
            services and increasing patient centricity.
          </p>
        </div>
        <div className="col-4 p-2 box1">
          <p className="head">
            <strong>Vision </strong>
          </p>
          <p className="par">
            To ensure consistent quality and advanced surgical care and take the
            latest medical technologies to Tier 2 and Tier 3 cities.
          </p>
        </div>
        <div className="col-4 p-2 box1">
          <p className="head">
            <strong>Value </strong>
          </p>
          <p className="par">
            To collaborate as a team and take extreme ownership of our audacious
            goals to achieve targets and display tremendous Integrity.
          </p>
        </div>
      </div>
      <div className="col-12">
      <div className="row SS">
          <div className="service">
            <h1>Our Expertise</h1>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/lung.png" alt="Lung Diseases" />
            <h4>Lung Diseases</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/heart1.png" alt="Heart Diseases" />
            <h4>Heart Diseases</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/ortho.png" alt="Orthopaedic" />
            <h4>Orthopaedic</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/general.png" alt="General Surgery" />
            <h4>General Surgery</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/pharma.png" alt="Pharmacy" />
            <h4>Pharmacy</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          <div className="col-md-4 sr">
            <img src="/Icon/sports.png" alt="Sports Injury" />
            <h4>Sports Injury</h4>
            <p>
              One of the key classifications is between traditio nal small
              molecule drugs; usually derived from chemical synthesis
            </p>
          </div>
          </div>
      </div>
     </div>
  );
};

export default AboutUs;
