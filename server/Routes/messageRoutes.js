const express = require("express");
const Message = require("../Models/Message");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

// The name a provider's dashboard is keyed on (same rule as appointments).
const providerName = (user) => user.providerName || user.name;

// Loads a message and makes sure it belongs to the logged-in provider (or an
// admin). Attaches it to req.msg. Used by every per-message mutation.
async function ownMessage(req, res, next) {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    const mine =
      req.user.role === "admin" ||
      (msg.receiverType === req.user.role &&
        msg.receiverName === providerName(req.user));
    if (!mine) return res.status(403).json({ error: "Not your message" });
    req.msg = msg;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/* SEND  POST /api/messages/send  — public (guests and patients)
   { senderName, senderEmail, subject, message, receiverType,
     receiverId, receiverName, receiverSpeciality?, receiverCity? } */
router.post("/send", async (req, res) => {
  const {
    senderName,
    senderEmail,
    subject,
    message,
    receiverType,
    receiverId,
    receiverName,
    receiverSpeciality,
    receiverCity,
    senderType,
  } = req.body;

  if (!senderName || !senderEmail || !subject || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, subject and message are required" });
  }
  if (!["doctor", "hospital"].includes(receiverType)) {
    return res.status(400).json({ error: "Choose a doctor or a hospital" });
  }
  if (!receiverId || !receiverName) {
    return res
      .status(400)
      .json({ error: `Select a ${receiverType} to contact` });
  }

  try {
    const msg = await Message.create({
      senderName,
      senderEmail,
      subject,
      message,
      receiverType,
      receiverId,
      receiverName,
      receiverSpeciality,
      receiverCity,
      senderType: senderType === "patient" ? "patient" : "guest",
    });
    return res.status(201).json({ ok: true, id: msg._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* INBOX  GET /api/messages/incoming?box=inbox|archived
   The logged-in provider's messages, routed by name. (Main UI endpoint.) */
router.get("/incoming", protect, allow("doctor", "hospital"), async (req, res) => {
  try {
    const box = req.query.box || "inbox";
    const filter = {
      receiverType: req.user.role,
      receiverName: providerName(req.user),
      archived: box === "archived",
    };
    const msgs = await Message.find(filter).sort({ createdAt: -1 });
    return res.json(msgs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* UNREAD COUNT  GET /api/messages/unread-count  — for the dashboard badge */
router.get("/unread-count", protect, allow("doctor", "hospital"), async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverType: req.user.role,
      receiverName: providerName(req.user),
      archived: false,
      status: "unread",
    });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* BY CATALOG ID (spec endpoints) — admin or the matching provider only */
router.get("/doctor/:doctorId", protect, async (req, res) => {
  try {
    const msgs = await Message.find({
      receiverType: "doctor",
      receiverId: req.params.doctorId,
    }).sort({ createdAt: -1 });
    return res.json(msgs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/hospital/:hospitalId", protect, async (req, res) => {
  try {
    const msgs = await Message.find({
      receiverType: "hospital",
      receiverId: req.params.hospitalId,
    }).sort({ createdAt: -1 });
    return res.json(msgs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* MARK READ  PATCH /api/messages/:id/read */
router.patch("/:id/read", protect, ownMessage, async (req, res) => {
  try {
    if (req.msg.status === "unread") req.msg.status = "read";
    await req.msg.save();
    return res.json(req.msg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* REPLY  PATCH /api/messages/:id/reply  { reply } */
router.patch("/:id/reply", protect, ownMessage, async (req, res) => {
  const { reply } = req.body;
  if (!reply || !reply.trim()) {
    return res.status(400).json({ error: "Reply can't be empty" });
  }
  try {
    req.msg.replies.push({ text: reply.trim() });
    req.msg.status = "replied";
    await req.msg.save();
    return res.json(req.msg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ARCHIVE / UNARCHIVE  PATCH /api/messages/:id/archive  { archived? } */
router.patch("/:id/archive", protect, ownMessage, async (req, res) => {
  try {
    req.msg.archived =
      req.body.archived === undefined ? true : !!req.body.archived;
    await req.msg.save();
    return res.json(req.msg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ASSIGN TO DEPARTMENT  PATCH /api/messages/:id/assign  { department }  (hospital) */
router.patch("/:id/assign", protect, allow("hospital", "admin"), ownMessage, async (req, res) => {
  try {
    req.msg.assignedDepartment = req.body.department || "";
    await req.msg.save();
    return res.json(req.msg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* DELETE  DELETE /api/messages/:id */
router.delete("/:id", protect, ownMessage, async (req, res) => {
  try {
    await req.msg.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
