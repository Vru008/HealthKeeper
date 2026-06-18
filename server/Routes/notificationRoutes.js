const express = require("express");
const Notification = require("../Models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

/* GET /api/notifications — mine, newest first */
router.get("/", async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/notifications/unread-count */
router.get("/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /api/notifications/:id/read */
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /api/notifications/read-all */
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
