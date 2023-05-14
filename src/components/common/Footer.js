import { Link } from "react-router-dom";
import "./footer.css";
import Service from "./Service";

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
          <Link href="#" className="fa faaa fa-facebook">
            <i class="bx bxl-facebook"></i>
          </Link>
          <Link href="#" className="fa faaa fa-twitter">
            <i class="bx bxl-twitter"></i>
          </Link>
          <Link href="#" className="fa faaa fa-instagram">
            <i class="bx bxl-instagram-alt"></i>
          </Link>
          <Link href="#" className="fa faaa fa-google">
            <i class="bx bxl-google"></i>
          </Link>
          <Link href="#" className="fa faaa fa-youtube">
            <i class="bx bxl-youtube"></i>
          </Link>
        </div>
      </section>

      <section className="">
        <div className="container text-center text-md-start mt-5">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <div className="fimage">
                <Link class="link" to="/">
                  <img src="/Logo/lg6.png"></img>
                </Link>
              </div>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <strong>Services</strong>
              </h6>
              <p>
              <Link to="/home#primary_care">Primary Care</Link>
                <a href="#!" className="text-reset" onClick="Service()">
                  Primary Care
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Emergrncy cases
                </a>
              </p>
              <p>
                <a href="#!" className="text-reset">
                  Online Appoinment
                </a>
              </p>
              {/* <p>
              <Link to={this.props.myroute} onClick='Service()'>Primary Care</Link>
              </p> */}
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
                <Link to="/aboutus" className="text-reset">
                  About-us
                </Link>
              </p>
              <p>
                <Link to="/Contact" className="text-reset">
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
