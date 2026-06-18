const express = require("express");
const Treatment = require("../Models/Treatment");
const Consent = require("../Models/Consent");
const AuditLog = require("../Models/AuditLog");
const Notification = require("../Models/Notification");
const User = require("../Models/User");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const providerName = (u) => u.providerName || u.name;
const writeAudit = (e) => AuditLog.create(e).catch(() => {});
const notify = (e) => Notification.create(e).catch(() => {});

// Does the logged-in provider currently have `scope` on this patient?
async function consentFor(reqUser, patientId, scope) {
  if (reqUser.role !== "doctor" && reqUser.role !== "hospital") return null;
  const consent = await Consent.findOne({
    patient: patientId,
    providerName: providerName(reqUser),
    providerRole: reqUser.role,
    status: "active",
    $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  });
  if (!consent) return null;
  if (scope && !consent.scopes.includes(scope)) return null;
  return consent;
}

/* PATIENT: GET /api/treatments/mine */
router.get("/mine", allow("patient"), async (req, res) => {
  try {
    const list = await Treatment.find({ patient: req.user._id }).sort({
      updatedAt: -1,
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PROVIDER: GET /api/treatments/patient/:patientId  (needs view consent) */
router.get("/patient/:patientId", allow("doctor", "hospital"), async (req, res) => {
  try {
    const consent = await consentFor(req.user, req.params.patientId, "view");
    if (!consent) {
      return res.status(403).json({ error: "This patient hasn't shared records with you" });
    }
    const list = await Treatment.find({ patient: req.params.patientId }).sort({
      updatedAt: -1,
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PROVIDER: POST /api/treatments/patient/:patientId  (needs add consent) */
router.post("/patient/:patientId", allow("doctor", "hospital"), async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ error: "Plan title is required" });
  try {
    const consent = await consentFor(req.user, req.params.patientId, "add");
    if (!consent) {
      return res.status(403).json({ error: "You don't have permission to manage care plans for this patient" });
    }
    const patient = await User.findById(req.params.patientId).select("name");
    const t = await Treatment.create({
      patient: req.params.patientId,
      title,
      description,
      status: ["active", "paused", "completed"].includes(status) ? status : "active",
      providerName: providerName(req.user),
      providerRole: req.user.role,
      createdBy: req.user._id,
      updates: [
        {
          note: "Care plan started.",
          status: "active",
          byName: providerName(req.user),
          byRole: req.user.role,
        },
      ],
    });
    notify({
      user: req.params.patientId,
      type: "treatment",
      title: "New care plan",
      body: `${providerName(req.user)} started a care plan: ${title}`,
      link: "/records",
    });
    writeAudit({
      actor: req.user._id,
      actorName: providerName(req.user),
      actorRole: req.user.role,
      action: "added-record",
      patient: req.params.patientId,
      patientName: patient?.name,
      meta: `care plan: ${title}`,
    });
    return res.status(201).json(t);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PROVIDER: POST /api/treatments/:id/update  { note, status? } */
router.post("/:id/update", allow("doctor", "hospital"), async (req, res) => {
  const { note, status } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ error: "Write an update note" });
  }
  try {
    const t = await Treatment.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Care plan not found" });
    const consent = await consentFor(req.user, t.patient, "add");
    if (!consent) {
      return res.status(403).json({ error: "You can't update this care plan" });
    }
    const newStatus = ["active", "paused", "completed"].includes(status)
      ? status
      : undefined;
    t.updates.push({
      note: note.trim(),
      status: newStatus,
      byName: providerName(req.user),
      byRole: req.user.role,
    });
    if (newStatus) t.status = newStatus;
    await t.save();
    notify({
      user: t.patient,
      type: "update",
      title: "Care plan update",
      body: `${providerName(req.user)} updated "${t.title}"`,
      link: "/records",
    });
    writeAudit({
      actor: req.user._id,
      actorName: providerName(req.user),
      actorRole: req.user.role,
      action: "added-record",
      patient: t.patient,
      meta: `care plan update: ${t.title}`,
    });
    return res.json(t);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
