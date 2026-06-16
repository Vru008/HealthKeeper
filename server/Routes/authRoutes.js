const express = require("express");
const User = require("../Models/User");
const { protect, signToken } = require("../middleware/auth");

const router = express.Router();

// No hardcoded fallback — admin signup is disabled unless ADMIN_CODE is set in env.
const ADMIN_CODE = process.env.ADMIN_CODE;

// Shape the user object we send back (never include the password).
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone || "",
  role: u.role || "patient",
  providerName: u.providerName || "",
  speciality: u.speciality || "",
  city: u.city || "",
});

/* REGISTER  POST /api/auth/register
   { name, email, password, phone?, role?, providerName?, speciality?, city?, adminCode? } */
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    providerName,
    speciality,
    city,
    adminCode,
  } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  // Resolve the requested role safely.
  let finalRole = "patient";
  if (["doctor", "hospital"].includes(role)) finalRole = role;
  if (role === "admin") {
    if (!ADMIN_CODE || adminCode !== ADMIN_CODE) {
      return res
        .status(403)
        .json({ error: "Admin registration is not available" });
    }
    finalRole = "admin";
  }

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
      providerName:
        finalRole === "doctor" || finalRole === "hospital"
          ? providerName || name
          : undefined,
      speciality: finalRole === "doctor" ? speciality : undefined,
      city: ["doctor", "hospital"].includes(finalRole) ? city : undefined,
    });

    return res
      .status(201)
      .json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* LOGIN  POST /api/auth/login  { email, password } */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* CURRENT USER  GET /api/auth/me  (requires token) */
router.get("/me", protect, (req, res) => {
  return res.json({ user: publicUser(req.user) });
});

module.exports = router;
