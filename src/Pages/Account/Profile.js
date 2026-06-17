import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api";
import { specialities, locations } from "../../data/lists";
import "./account.css";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { show } = useToast();
  const isProvider = user.role === "doctor" || user.role === "hospital";

  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    providerName: user.providerName || "",
    speciality: user.speciality || specialities[0],
    city: user.city || locations[0],
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/auth/me", form);
      updateUser(res.data.user);
      show("Profile updated");
    } catch (err) {
      show(err.response?.data?.error || "Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-wrap">
        <h1 className="account-title">My Account</h1>
        <AccountNav />

        <div className="account-card">
          <div className="account-head">
            <span className={`account-avatar av-${user.role}`}>
              {initials(user.name)}
            </span>
            <div>
              <h2>{user.name}</h2>
              <span className={`pill pill-role-${user.role}`}>{user.role}</span>
            </div>
          </div>

          <form onSubmit={save} className="account-form">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={onChange} required />

            <label>Email</label>
            <input value={user.email} disabled className="acc-readonly" />
            <span className="acc-hint">Email can't be changed.</span>

            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="+91 00000 00000"
            />

            {isProvider && (
              <>
                <label>
                  {user.role === "hospital" ? "Hospital name" : "Display name"}
                </label>
                <input
                  name="providerName"
                  value={form.providerName}
                  onChange={onChange}
                />
                <label>City</label>
                <select name="city" value={form.city} onChange={onChange}>
                  {locations.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </>
            )}
            {user.role === "doctor" && (
              <>
                <label>Speciality</label>
                <select
                  name="speciality"
                  value={form.speciality}
                  onChange={onChange}
                >
                  {specialities.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </>
            )}

            <button className="acc-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
