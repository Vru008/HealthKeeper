const mongoose = require("mongoose");

// Append-only access/action trail. Every time a provider views or adds a
// patient's records (or a patient grants/revokes access), we record who did
// what and when, so the patient can see exactly who touched their data.
const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorName: String,
    actorRole: String,
    action: { type: String, required: true }, // e.g. "viewed-records", "added-record", "granted-access", "revoked-access"
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    patientName: String,
    record: { type: mongoose.Schema.Types.ObjectId, ref: "HealthRecord" },
    meta: String,
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("AuditLog", auditSchema);
