const mongoose = require("mongoose");

// A patient-controlled access grant. The patient grants a specific provider
// (identified by name + role, the same key appointments/messages route on)
// a set of scopes over their health records. Patients can revoke any time.
const consentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerName: { type: String, required: true },
    providerRole: { type: String, enum: ["doctor", "hospital"], required: true },
    scopes: {
      type: [String], // "view", "add"
      default: ["view"],
    },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: Date,
    expiresAt: Date, // optional auto-expiry
  },
  { timestamps: true }
);

consentSchema.index({ providerName: 1, providerRole: 1, status: 1 });

module.exports = mongoose.model("Consent", consentSchema);
