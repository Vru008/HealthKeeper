import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoLink, setDemoLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await api.post("/auth/forgot", { email });
      setSent(true);
      // Demo fallback: when no email service is configured, the server returns
      // the token so the flow is still testable.
      if (r.data.devResetToken) {
        setDemoLink(
          `${window.location.origin}/reset-password?token=${r.data.devResetToken}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot password</h2>

        {sent ? (
          <>
            <p className="auth-subtitle">
              If an account exists for <strong>{email}</strong>, we've sent a
              link to reset your password. Check your inbox (and spam).
            </p>
            {demoLink && (
              <div className="auth-demo">
                <strong>Demo mode</strong> — email isn't configured, so use this
                link:
                <br />
                <Link to={demoLink.replace(window.location.origin, "")}>
                  Reset your password →
                </Link>
              </div>
            )}
            <p className="auth-switch">
              <Link to="/login">Back to log in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-subtitle">
              Enter your email and we'll send you a reset link.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="auth-switch">
              Remembered it? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
