const mongoose = require("mongoose");

// A single clinical record belonging to a patient. It can be self-added by the
// patient or added by a doctor/hospital that the patient has granted "add"
// access to. An optional file is stored inline as base64 (size-capped in the
// route) so the app stays on free-tier hosting.
const recordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Optional: which family member this record is for (unset = the account holder).
    member: { type: mongoose.Schema.Types.ObjectId, ref: "FamilyMember" },
    memberName: String,
    type: {
      type: String,
      enum: ["diagnosis", "prescription", "lab-report", "imaging", "note", "vaccination"],
      required: true,
    },
    title: { type: String, required: true },
    details: String,
    doctorName: String,
    hospitalName: String,
    date: { type: Date, default: Date.now },

    file: {
      name: String,
      mime: String,
      size: Number,
      data: String, // base64 data URL
    },

    // Provenance — who created this record.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: String,
    createdByRole: { type: String, enum: ["patient", "doctor", "hospital", "admin"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", recordSchema);
