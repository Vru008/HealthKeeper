const express = require("express");
const Appointment = require("../Models/Appointment");
const { protect, allow } = require("../middleware/auth");
const { sendAppointmentEmail } = require("../utils/mailer");

const router = express.Router();

/* INCOMING  GET /api/appointments/incoming  (doctor / hospital)
   Appointments booked under this provider's name. */
router.get("/incoming", protect, allow("doctor", "hospital"), async (req, res) => {
  try {
    const name = req.user.providerName || req.user.name;
    const appts = await Appointment.find({ provider: name })
      .populate("user", "name email phone")
      .sort({ datetime: 1 });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* CREATE  POST /api/appointments  (requires login)
   { patientName, phone?, gender?, city?, speciality?, provider?, datetime } */
router.post("/", protect, async (req, res) => {
  const { patientName, phone, gender, city, speciality, provider, datetime } =
    req.body;

  if (!patientName || !datetime) {
    return res
      .status(400)
      .json({ error: "Patient name and appointment date/time are required" });
  }

  try {
    const appt = await Appointment.create({
      user: req.user._id,
      patientName,
      phone,
      gender,
      city,
      speciality,
      provider,
      datetime,
    });

    // Fire-and-forget confirmation email (only if SMTP is configured).
    sendAppointmentEmail(req.user.email, appt).catch(() => {});

    return res.status(201).json(appt);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* LIST MINE  GET /api/appointments  (requires login) */
router.get("/", protect, async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id }).sort({
      datetime: 1,
    });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* CANCEL  DELETE /api/appointments/:id  (requires login) */
router.delete("/:id", protect, async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "cancelled" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    return res.json(appt);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
