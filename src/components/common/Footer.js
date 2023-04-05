import { Link } from "react-router-dom";
import './footer.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="text-center text-lg-start bg-light text-muted">  
      <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div className="me-5 d-none d-lg-block">
          <span>
            <strong> connected with us on social networks:</strong>
          </span>
        </div>
        <div>
          <Link href="#" className="fa faaa fa-facebook"></Link>
          <Link href="#" className="fa faaa fa-twitter"></Link>
          <Link href="#" className="fa faaa fa-google"></Link>
          <Link href="#" className="fa faaa fa-youtube"></Link>
          <Link href="#" className="fa faaa fa-instagram"></Link>
        </div>
      </section>

      <section className="">
        <div className="container text-center text-md-start mt-5">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>
                  <i className="fas fa-gem me-3"></i>Healthkeeper
                </strong>
              </h6>
              <img src="/image/logo.jpg" alt="about" />
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>Services</strong>
              </h6>
              <p>
                <Link href="#!" className="text-reset">
                  Primary Care
                </Link>
              </p>
              <p>
                <Link href="#!" className="text-reset">
                  Emergrncy cases
                </Link>
              </p>
              <p>
                <Link href="#!" className="text-reset">
                  Online Appoinment
                </Link>
              </p>
            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>link</strong>
              </h6>
              <p>
                <Link to="/Home" className="text-reset">
                  Home
                </Link>
              </p>
              <p>
                <Link to="/AboutUs" className="text-reset">
                  About us
                </Link>
              </p>
              <p>
                <Link to="/Department" className="text-reset">
                  Department
                </Link>
              </p>
              <p>
                <Link to="/Doctor" className="text-reset">
                  Doctor
                </Link>
              </p>
              <p>
                <Link to="/Hospital" className="text-reset">
                  Hospital
                </Link>
              </p>
            </div>
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>Contact</strong>
              </h6>
              <p className="faa">
                <i className="fa fa-home me-3"></i> Ahmedabad, 382418, India
              </p>
              <p className="faa">
                <i className="fa fa-envelope me-3"></i>
                healthkeeper@gmail.com
              </p>
              <p className="faa">
                <i className="fa fa-phone me-3"></i> + 01 234 567 88
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center p-4">
        © 2021 Copyright:
        <Link className="text-reset fw-bold" href="Healthkeeper.com">
          Healthkeeper.com
        </Link>
      </div>
    </footer>
    </div>
  )
}

export default Footer;
