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

module.exports = router;
