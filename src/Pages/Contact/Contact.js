import React, { useState, useMemo } from "react";
import api from "../../api";
import { useCatalog } from "../../context/CatalogContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import SearchableSelect from "../../components/SearchableSelect";
import "./contact.css";

const Contact = () => {
  const { doctors, hospitals, loading } = useCatalog();
  const { user } = useAuth();
  const { show } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [receiverType, setReceiverType] = useState("doctor");
  const [receiver, setReceiver] = useState(null); // selected option
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Build searchable option lists once per catalog load.
  const doctorOptions = useMemo(
    () =>
      doctors.map((d) => ({
        value: d.id,
        label: d.name,
        sub: `${d.speciality} · ${d.location}`,
        keywords: `${d.name} ${d.speciality} ${d.location}`,
        raw: d,
      })),
    [doctors]
  );
  const hospitalOptions = useMemo(
    () =>
      hospitals.map((h) => ({
        value: h.id,
        label: h.name,
        sub: `${(h.specialities || []).slice(0, 3).join(", ")} · ${h.location}`,
        keywords: `${h.name} ${(h.specialities || []).join(" ")} ${h.location}`,
        raw: h,
      })),
    [hospitals]
  );

  const switchType = (type) => {
    setReceiverType(type);
    setReceiver(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiver) {
      show(`Please select a ${receiverType} to contact`, "error");
      return;
    }
    setBusy(true);
    try {
      const r = receiver.raw;
      await api.post("/messages/send", {
        senderName: form.name,
        senderEmail: form.email,
        subject: form.subject,
        message: form.message,
        receiverType,
        receiverId: r.id,
        receiverName: r.name,
        receiverSpeciality:
          receiverType === "doctor" ? r.speciality : undefined,
        receiverCity: r.location,
        senderType: user ? "patient" : "guest",
      });
      setSent(true);
      show("Message sent ✓");
    } catch (err) {
      show(err.response?.data?.error || "Couldn't send message", "error");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      subject: "",
      message: "",
    });
    setReceiver(null);
    setSent(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        {/* Info panel */}
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p className="contact-blurb">
            Have a question for a specific doctor or hospital? Pick them below
            and your message lands straight in their inbox — usually answered
            within a day.
          </p>

          <ul className="contact-list">
            <li>
              <span className="ci-icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>India</p>
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
              <p>
                Your message was delivered to{" "}
                <strong>{receiver?.label}</strong>. They'll get back to you by
                email.
              </p>
              <button className="contact-btn" onClick={reset}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>Send a message</h3>

              <label>Who do you want to contact?</label>
              <div className="contact-seg">
                <button
                  type="button"
                  className={receiverType === "doctor" ? "seg active" : "seg"}
                  onClick={() => switchType("doctor")}
                >
                  🩺 Doctor
                </button>
                <button
                  type="button"
                  className={receiverType === "hospital" ? "seg active" : "seg"}
                  onClick={() => switchType("hospital")}
                >
                  🏥 Hospital
                </button>
              </div>

              <label>
                {receiverType === "doctor" ? "Select doctor" : "Select hospital"}
              </label>
              <SearchableSelect
                options={
                  receiverType === "doctor" ? doctorOptions : hospitalOptions
                }
                value={receiver?.value}
                onChange={setReceiver}
                placeholder={
                  loading
                    ? "Loading…"
                    : `Search ${receiverType}s by name, department or city`
                }
              />

              <label htmlFor="c-name">Your name</label>
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
              <label htmlFor="c-subject">Subject</label>
              <input
                id="c-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                required
              />
              <label htmlFor="c-msg">Message</label>
              <textarea
                id="c-msg"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can they help?"
                rows={4}
                required
              />
              <button type="submit" className="contact-btn" disabled={busy}>
                {busy ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
