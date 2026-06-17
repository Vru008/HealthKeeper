import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api";
import "./account.css";

const AccountNav = () => (
  <nav className="account-subnav">
    <NavLink to="/profile" className="acc-tab">
      👤 Profile
    </NavLink>
    <NavLink to="/settings" className="acc-tab">
      ⚙️ Settings
    </NavLink>
  </nav>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const { show } = useToast();

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [notifyPerm, setNotifyPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const onPw = (e) => setPw({ ...pw, [e.target.name]: e.target.value });

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      show("New passwords don't match", "error");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/auth/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      show("Password changed");
    } catch (err) {
      show(err.response?.data?.error || "Could not change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setNotifyPerm(p);
    show(
      p === "granted" ? "Notifications enabled" : "Notifications not enabled",
      p === "granted" ? "success" : "info"
    );
  };

  return (
    <div className="account-page">
      <div className="account-wrap">
        <h1 className="account-title">My Account</h1>
        <AccountNav />

        {/* Change password */}
        <div className="account-card">
          <h3 className="acc-section-title">Change password</h3>
          <form onSubmit={changePassword} className="account-form">
            <label>Current password</label>
            <input
              type="password"
              name="currentPassword"
              value={pw.currentPassword}
              onChange={onPw}
              required
            />
            <label>New password</label>
            <input
              type="password"
              name="newPassword"
              value={pw.newPassword}
              onChange={onPw}
              placeholder="At least 6 characters"
              required
            />
            <label>Confirm new password</label>
            <input
              type="password"
              name="confirm"
              value={pw.confirm}
              onChange={onPw}
              required
            />
            <button className="acc-btn" type="submit" disabled={saving}>
              {saving ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="account-card">
          <h3 className="acc-section-title">Notifications</h3>
          <div className="acc-row">
            <div>
              <strong>Appointment reminders</strong>
              <p className="acc-row-sub">
                Allow browser notifications when you book an appointment.
              </p>
            </div>
            {notifyPerm === "granted" ? (
              <span className="acc-status acc-on">Enabled</span>
            ) : (
              <button className="acc-btn-sm" onClick={enableNotifications}>
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="account-card">
          <h3 className="acc-section-title">Account</h3>
          <ul className="acc-info">
            <li>
              <span>Email</span>
              {user.email}
            </li>
            <li>
              <span>Role</span>
              <span className={`pill pill-role-${user.role}`}>{user.role}</span>
            </li>
          </ul>
          <button className="acc-btn-danger" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
