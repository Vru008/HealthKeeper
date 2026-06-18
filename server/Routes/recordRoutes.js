const express = require("express");
const HealthRecord = require("../Models/HealthRecord");
const Consent = require("../Models/Consent");
const AuditLog = require("../Models/AuditLog");
const User = require("../Models/User");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const MAX_FILE_BYTES = 3 * 1024 * 1024; // ~3 MB per attachment
const providerName = (u) => u.providerName || u.name;

const writeAudit = (entry) => AuditLog.create(entry).catch(() => {});

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

/* ============ PATIENT: own records ============ */

/* GET /api/records/mine */
router.get("/mine", allow("patient"), async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user._id }).sort({
      date: -1,
    });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /api/records  — patient self-adds a record */
router.post("/", allow("patient"), async (req, res) => {
  const { type, title, details, date, file, doctorName, hospitalName } = req.body;
  if (!type || !title) {
    return res.status(400).json({ error: "Type and title are required" });
  }
  if (file?.data && (file.size || file.data.length) > MAX_FILE_BYTES) {
    return res.status(400).json({ error: "Attachment too large (max 3 MB)" });
  }
  try {
    const rec = await HealthRecord.create({
      patient: req.user._id,
      type,
      title,
      details,
      doctorName,
      hospitalName,
      date: date || Date.now(),
      file: file?.data ? file : undefined,
      createdBy: req.user._id,
      createdByName: req.user.name,
      createdByRole: "patient",
    });
    return res.status(201).json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* DELETE /api/records/:id  — patient deletes own record */
router.delete("/:id", allow("patient"), async (req, res) => {
  try {
    await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ============ PATIENT: consent management ============ */

/* GET /api/records/consents — my grants */
router.get("/consents", allow("patient"), async (req, res) => {
  try {
    const consents = await Consent.find({ patient: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(consents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /api/records/consents  { providerName, providerRole, scopes[] } */
router.post("/consents", allow("patient"), async (req, res) => {
  const { providerName: pName, providerRole, scopes } = req.body;
  if (!pName || !["doctor", "hospital"].includes(providerRole)) {
    return res.status(400).json({ error: "Choose a doctor or hospital to share with" });
  }
  const cleanScopes = (Array.isArray(scopes) ? scopes : ["view"]).filter((s) =>
    ["view", "add"].includes(s)
  );
  if (cleanScopes.length === 0) cleanScopes.push("view");
  try {
    // Re-grant updates an existing (or revoked) grant instead of duplicating.
    let consent = await Consent.findOne({
      patient: req.user._id,
      providerName: pName,
      providerRole,
    });
    if (consent) {
      consent.scopes = cleanScopes;
      consent.status = "active";
      consent.grantedAt = new Date();
      consent.revokedAt = undefined;
    } else {
      consent = new Consent({
        patient: req.user._id,
        providerName: pName,
        providerRole,
        scopes: cleanScopes,
      });
    }
    await consent.save();
    writeAudit({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: "patient",
      action: "granted-access",
      patient: req.user._id,
      patientName: req.user.name,
      meta: `${providerRole}: ${pName} (${cleanScopes.join(", ")})`,
    });
    return res.status(201).json(consent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /api/records/consents/:id/revoke */
router.patch("/consents/:id/revoke", allow("patient"), async (req, res) => {
  try {
    const consent = await Consent.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: "revoked", revokedAt: new Date() },
      { new: true }
    );
    if (!consent) return res.status(404).json({ error: "Grant not found" });
    writeAudit({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: "patient",
      action: "revoked-access",
      patient: req.user._id,
      patientName: req.user.name,
      meta: `${consent.providerRole}: ${consent.providerName}`,
    });
    return res.json(consent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/records/audit — who accessed my data */
router.get("/audit", allow("patient"), async (req, res) => {
  try {
    const logs = await AuditLog.find({ patient: req.user._id })
      .sort({ at: -1 })
      .limit(100);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ============ PROVIDER: consented access ============ */

/* GET /api/records/patients?q=  — patients who granted me access (searchable) */
router.get("/patients", allow("doctor", "hospital"), async (req, res) => {
  try {
    const consents = await Consent.find({
      providerName: providerName(req.user),
      providerRole: req.user.role,
      status: "active",
    });
    const ids = consents.map((c) => c.patient);
    if (ids.length === 0) return res.json([]);

    const q = (req.query.q || "").trim();
    const filter = { _id: { $in: ids } };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }
    const patients = await User.find(filter).select("name email phone city");
    const byId = Object.fromEntries(consents.map((c) => [String(c.patient), c]));
    const counts = await HealthRecord.aggregate([
      { $match: { patient: { $in: ids } } },
      { $group: { _id: "$patient", n: { $sum: 1 } } },
    ]);
    const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));

    return res.json(
      patients.map((p) => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        city: p.city,
        scopes: byId[String(p._id)]?.scopes || [],
        records: countById[String(p._id)] || 0,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/records/patient/:patientId — that patient's records (needs view consent) */
router.get("/patient/:patientId", allow("doctor", "hospital"), async (req, res) => {
  try {
    const consent = await consentFor(req.user, req.params.patientId, "view");
    if (!consent) {
      return res.status(403).json({ error: "This patient hasn't shared records with you" });
    }
    const records = await HealthRecord.find({ patient: req.params.patientId }).sort({
      date: -1,
    });
    const patient = await User.findById(req.params.patientId).select("name email phone city");
    writeAudit({
      actor: req.user._id,
      actorName: providerName(req.user),
      actorRole: req.user.role,
      action: "viewed-records",
      patient: req.params.patientId,
      patientName: patient?.name,
      meta: `${records.length} record(s)`,
    });
    return res.json({ patient, records, scopes: consent.scopes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* POST /api/records/patient/:patientId — provider adds a record (needs add consent) */
router.post("/patient/:patientId", allow("doctor", "hospital"), async (req, res) => {
  const { type, title, details, date, file } = req.body;
  if (!type || !title) {
    return res.status(400).json({ error: "Type and title are required" });
  }
  if (file?.data && (file.size || file.data.length) > MAX_FILE_BYTES) {
    return res.status(400).json({ error: "Attachment too large (max 3 MB)" });
  }
  try {
    const consent = await consentFor(req.user, req.params.patientId, "add");
    if (!consent) {
      return res.status(403).json({ error: "You don't have permission to add records for this patient" });
    }
    const patient = await User.findById(req.params.patientId).select("name");
    const rec = await HealthRecord.create({
      patient: req.params.patientId,
      type,
      title,
      details,
      date: date || Date.now(),
      file: file?.data ? file : undefined,
      doctorName: req.user.role === "doctor" ? providerName(req.user) : undefined,
      hospitalName: req.user.role === "hospital" ? providerName(req.user) : undefined,
      createdBy: req.user._id,
      createdByName: providerName(req.user),
      createdByRole: req.user.role,
    });
    writeAudit({
      actor: req.user._id,
      actorName: providerName(req.user),
      actorRole: req.user.role,
      action: "added-record",
      patient: req.params.patientId,
      patientName: patient?.name,
      record: rec._id,
      meta: `${type}: ${title}`,
    });
    return res.status(201).json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
