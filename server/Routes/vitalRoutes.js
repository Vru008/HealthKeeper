const express = require("express");
const Vital = require("../Models/Vital");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

/* GET /api/vitals — my readings (newest first) */
router.get("/", async (req, res) => {
  try {
    const vitals = await Vital.find({ user: req.user._id }).sort({ date: -1 });
    return res.json(vitals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /api/vitals  { type, value?, systolic?, diastolic?, date? } */
router.post("/", async (req, res) => {
  const { type, value, systolic, diastolic, date } = req.body;
  if (!["bp", "sugar", "hba1c", "weight"].includes(type)) {
    return res.status(400).json({ error: "Invalid reading type" });
  }
  if (type === "bp") {
    if (!systolic || !diastolic) {
      return res.status(400).json({ error: "Enter systolic and diastolic" });
    }
  } else if (value === undefined || value === null || value === "") {
    return res.status(400).json({ error: "Enter a value" });
  }
  try {
    const vital = await Vital.create({
      user: req.user._id,
      type,
      value: type === "bp" ? undefined : Number(value),
      systolic: type === "bp" ? Number(systolic) : undefined,
      diastolic: type === "bp" ? Number(diastolic) : undefined,
      date: date || Date.now(),
    });
    return res.status(201).json(vital);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* DELETE /api/vitals/:id */
router.delete("/:id", async (req, res) => {
  try {
    await Vital.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
