const express = require("express");
const User = require("../Models/User");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

// Inline-storage caps so a submission can't blow past the JSON body limit.
const MAX_DOC_BYTES = 2 * 1024 * 1024; // ~2 MB per document
const MAX_DOCS = 8;

// Returns the verification block without the heavy base64 blobs.
const lightVerification = (v = {}) => ({
  status: v.status || "unverified",
  fields: v.fields || {},
  submittedAt: v.submittedAt,
  reviewedAt: v.reviewedAt,
  rejectionReason: v.rejectionReason,
  documents: (v.documents || []).map((d) => ({
    kind: d.kind,
    name: d.name,
    mime: d.mime,
    size: d.size,
    uploadedAt: d.uploadedAt,
  })),
});

/* GET /api/verification/me — the logged-in provider's status */
router.get("/me", protect, allow("doctor", "hospital"), async (req, res) => {
  return res.json(lightVerification(req.user.verification));
});

/* POST /api/verification/submit  { fields, documents:[{kind,name,mime,size,data}] } */
router.post("/submit", protect, allow("doctor", "hospital"), async (req, res) => {
  const { fields, documents } = req.body;
  if (!fields || typeof fields !== "object") {
    return res.status(400).json({ error: "Missing form details" });
  }
  if (!Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ error: "Please upload the required documents" });
  }
  if (documents.length > MAX_DOCS) {
    return res.status(400).json({ error: `Too many documents (max ${MAX_DOCS})` });
  }
  for (const d of documents) {
    if (!d.data || !d.kind) {
      return res.status(400).json({ error: "Each document needs a file" });
    }
    if ((d.size || d.data.length) > MAX_DOC_BYTES) {
      return res
        .status(400)
        .json({ error: `"${d.kind}" is too large (max 2 MB each)` });
    }
  }

  try {
    const user = await User.findById(req.user._id);
    user.verification = {
      status: "pending",
      fields,
      documents: documents.map((d) => ({
        kind: d.kind,
        name: d.name,
        mime: d.mime,
        size: d.size || d.data.length,
        data: d.data,
        uploadedAt: new Date(),
      })),
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      rejectionReason: undefined,
    };
    user.markModified("verification");
    await user.save();
    return res.json(lightVerification(user.verification));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ---- Admin review ---- */

/* GET /api/verification/pending — submissions awaiting review (no blobs) */
router.get("/pending", protect, allow("admin"), async (req, res) => {
  try {
    const users = await User.find({ "verification.status": "pending" })
      .select("name email role providerName speciality city verification")
      .sort({ "verification.submittedAt": 1 });
    return res.json(
      users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        providerName: u.providerName,
        speciality: u.speciality,
        city: u.city,
        verification: lightVerification(u.verification),
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* GET /api/verification/:userId — full submission incl. documents (admin) */
router.get("/:userId", protect, allow("admin"), async (req, res) => {
  try {
    const u = await User.findById(req.params.userId).select(
      "name email role providerName speciality city verification"
    );
    if (!u) return res.status(404).json({ error: "User not found" });
    return res.json({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      providerName: u.providerName,
      speciality: u.speciality,
      city: u.city,
      verification: u.verification, // includes document data for viewing
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* PATCH /api/verification/:userId/review  { decision: "verified"|"rejected", reason? } */
router.patch("/:userId/review", protect, allow("admin"), async (req, res) => {
  const { decision, reason } = req.body;
  if (!["verified", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "decision must be verified or rejected" });
  }
  try {
    const u = await User.findById(req.params.userId);
    if (!u) return res.status(404).json({ error: "User not found" });
    if (!u.verification || u.verification.status === "unverified") {
      return res.status(400).json({ error: "Nothing submitted to review" });
    }
    u.verification.status = decision;
    u.verification.reviewedAt = new Date();
    u.verification.reviewedBy = req.user.name;
    u.verification.rejectionReason = decision === "rejected" ? reason || "" : "";
    u.markModified("verification");
    await u.save();
    return res.json(lightVerification(u.verification));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
