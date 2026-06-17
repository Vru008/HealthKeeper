const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["bp", "sugar", "hba1c", "weight"],
      required: true,
    },
    // bp uses systolic/diastolic; the others use value.
    systolic: Number,
    diastolic: Number,
    value: Number,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vital", vitalSchema);
