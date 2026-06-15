import { Link } from "react-router-dom";
import "./footer.css";

const Footer = (props) => {
  return (
    <footer className="text-center text-lg-start text-muted">
      <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div className="me-5 d-none d-lg-block">
          <span>
            <strong> connected with us on social networks:</strong>
          </span>
        </div>
        <div>
          <a href="#!" className="fa faaa fa-facebook" aria-label="Facebook">
            <i className="bx bxl-facebook"></i>
          </a>
          <a href="#!" className="fa faaa fa-twitter" aria-label="Twitter">
            <i className="bx bxl-twitter"></i>
          </a>
          <a href="#!" className="fa faaa fa-instagram" aria-label="Instagram">
            <i className="bx bxl-instagram-alt"></i>
          </a>
          <a href="#!" className="fa faaa fa-google" aria-label="Google">
            <i className="bx bxl-google"></i>
          </a>
          <a href="#!" className="fa faaa fa-youtube" aria-label="YouTube">
            <i className="bx bxl-youtube"></i>
          </a>
        </div>
      </section>

      <section className="">
        <div className="container text-center text-md-start mt-5">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <div className="fimage">
                <Link className="link" to="/">
                  <img src="/Logo/lg6.png" alt="HealthKeeper logo" />
                </Link>
              </div>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>Services</strong>
              </h6>
              <p>
                <a href="#!" className="text-reset">
                  Primary Care
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Emergency cases
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Online Appointment
                </a>
              </p>
            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>link</strong>
              </h6>
              <p>
                <Link to="/" className="text-reset">
                  Home
                </Link>
              </p>
              <p>
                <Link to="/aboutUs" className="text-reset">
                  About-us
                </Link>
              </p>
              <p>
                <Link to="/contact" className="text-reset">
                  Contact-us
                </Link>
              </p>
              <p></p>
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
                <a href="mailto:healthkeeper@gmail.com">healthkeeper@gmail.com</a>
              </p>
              <p className="faa">
                <i className="fa fa-phone me-3"></i> 
                <a href="tel:+ 01 234 567 88">+ 01 234 567 88</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center p-4">
        
        <a className="text-reset fw-bold" href="Healthkeeper.com">
        &copy; 2023 HealthKeeper
        </a>
      </div>
    </footer>
  );
};

export default Footer;
