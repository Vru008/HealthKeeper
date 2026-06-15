import React, { useState } from "react";
import "./contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        {/* Info panel */}
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p className="contact-blurb">
            Questions about booking, your account, or a hospital? We're here to
            help — reach out and we'll get back to you within a day.
          </p>

          <ul className="contact-list">
            <li>
              <span className="ci-icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>Ahmedabad, Gujarat 382418, India</p>
              </div>
            </li>
            <li>
              <span className="ci-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <p>
                  <a href="mailto:support@healthkeeper.com">
                    support@healthkeeper.com
                  </a>
                </p>
              </div>
            </li>
            <li>
              <span className="ci-icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>
                  <a href="tel:+910000000000">+91 00000 00000</a>
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-success">
              <div className="cs-check">✓</div>
              <h3>Thanks, {form.name || "there"}!</h3>
              <p>Your message has been received. We'll be in touch soon.</p>
              <button
                className="contact-btn"
                onClick={() => {
                  setForm({ name: "", email: "", message: "" });
                  setSent(false);
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>Send us a message</h3>
              <label htmlFor="c-name">Name</label>
              <input
                id="c-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              <label htmlFor="c-msg">Message</label>
              <textarea
                id="c-msg"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                rows={4}
                required
              />
              <button type="submit" className="contact-btn">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
