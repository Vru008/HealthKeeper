const express = require("express");
const User = require("../Models/User");
const Appointment = require("../Models/Appointment");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

// Everything here is admin-only.
router.use(protect, allow("admin"));

/* GET /api/admin/stats — platform overview numbers */
router.get("/stats", async (req, res) => {
  try {
    const [patients, doctors, hospitals, appointments, booked, cancelled] =
      await Promise.all([
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        User.countDocuments({ role: "hospital" }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "booked" }),
        Appointment.countDocuments({ status: "cancelled" }),
      ]);

    const bySpeciality = await Appointment.aggregate([
      { $group: { _id: "$speciality", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    return res.json({
      patients,
      doctors,
      hospitals,
      appointments,
      booked,
      cancelled,
      bySpeciality,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/admin/users — all accounts */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/admin/appointments — every appointment */
router.get("/appointments", async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("user", "name email")
      .sort({ datetime: -1 });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const safeUser = (u) => {
  const o = u.toObject();
  delete o.password;
  return o;
};

const ROLES = ["patient", "doctor", "hospital", "admin"];

/* CREATE  POST /api/admin/users  { name, email, password, role, phone?, providerName?, speciality?, city? } */
router.post("/users", async (req, res) => {
  const { name, email, password, role, phone, providerName, speciality, city } =
    req.body;

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
  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: "Email already in use" });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || "patient",
      phone,
      providerName,
      speciality,
      city,
    });
    return res.status(201).json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* UPDATE  PATCH /api/admin/users/:id  (any subset of editable fields) */
router.patch("/users/:id", async (req, res) => {
  const { name, email, role, phone, password, providerName, speciality, city } =
    req.body;

  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Don't let an admin demote themselves out of admin (locks them out).
    if (
      String(user._id) === String(req.user._id) &&
      role &&
      role !== "admin"
    ) {
      return res
        .status(400)
        .json({ error: "You can't change your own admin role" });
    }

    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) return res.status(409).json({ error: "Email already in use" });
      user.email = email.toLowerCase();
    }
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (providerName !== undefined) user.providerName = providerName;
    if (speciality !== undefined) user.speciality = speciality;
    if (city !== undefined) user.city = city;
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }
      user.password = password; // re-hashed by the model's pre-save hook
    }

    await user.save();
    return res.json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* DELETE  DELETE /api/admin/users/:id */
router.delete("/users/:id", async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ error: "You can't delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ ok: true, id: req.params.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
