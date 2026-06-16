import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">🩺 HealthKeeper</div>
          <p>
            Find trusted doctors and hospitals across India — and book in
            seconds, with reminders sent straight to your calendar.
          </p>
          <div className="footer-social">
            <a href="#!" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
              </svg>
            </a>
            <a href="#!" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M18.9 1.6h3.7l-8 9.2 9.5 12.6h-7.4l-5.8-7.6-6.7 7.6H.5l8.6-9.8L0 1.6h7.6l5.2 6.9zM17.6 21.3h2L6.5 3.6H4.3z" />
              </svg>
            </a>
            <a href="#!" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.9.07s-3.63 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2zm0 1.95c-3.16 0-3.53.01-4.78.07-.9.04-1.38.19-1.7.32-.43.16-.74.36-1.06.68-.32.32-.52.63-.68 1.06-.13.32-.28.8-.32 1.7-.06 1.25-.07 1.62-.07 4.78s.01 3.53.07 4.78c.04.9.19 1.38.32 1.7.16.43.36.74.68 1.06.32.32.63.52 1.06.68.32.13.8.28 1.7.32 1.25.06 1.62.07 4.78.07s3.53-.01 4.78-.07c.9-.04 1.38-.19 1.7-.32.43-.16.74-.36 1.06-.68.32-.32.52-.63.68-1.06.13-.32.28-.8.32-1.7.06-1.25.07-1.62.07-4.78s-.01-3.53-.07-4.78c-.04-.9-.19-1.38-.32-1.7a2.85 2.85 0 0 0-.68-1.06 2.85 2.85 0 0 0-1.06-.68c-.32-.13-.8-.28-1.7-.32-1.25-.06-1.62-.07-4.78-.07zm0 3.32a4.53 4.53 0 1 1 0 9.06 4.53 4.53 0 0 1 0-9.06zm0 7.47a2.94 2.94 0 1 0 0-5.88 2.94 2.94 0 0 0 0 5.88zm5.77-7.69a1.06 1.06 0 1 1-2.12 0 1.06 1.06 0 0 1 2.12 0z" />
              </svg>
            </a>
            <a href="#!" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/department">Departments</Link>
          <Link to="/aboutUs">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Log In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/appointments">My Appointments</Link>
        </div>

        <div className="footer-col">
          <h4>Get in touch</h4>
          <p className="fc-line">📍 India</p>
          <p className="fc-line">
            <a href="mailto:support@healthkeeper.com">
              support@healthkeeper.com
            </a>
          </p>
          <p className="fc-line">
            <a href="tel:+910000000000">+91 00000 00000</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 HealthKeeper · Built for better healthcare.
      </div>
    </footer>
  );
};

export default Footer;
