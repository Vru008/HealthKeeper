const mongoose = require("mongoose");

// A timeline entry on a care plan — a progress note plus an optional status change.
const updateSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    status: { type: String, enum: ["active", "paused", "completed"] },
    byName: String,
    byRole: { type: String, enum: ["patient", "doctor", "hospital", "admin"] },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// A care plan / treatment a provider tracks for a patient (e.g. "Type 2
// Diabetes management"). Created by a doctor/hospital the patient granted
// "add" access to; the patient sees its timeline and gets alerted on updates.
const treatmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true }, // condition / plan name
    description: String,
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    updates: [updateSchema],

    providerName: String,
    providerRole: { type: String, enum: ["doctor", "hospital"] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Treatment", treatmentSchema);
