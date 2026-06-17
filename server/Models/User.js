const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// An uploaded credential document, stored inline as a base64 data URL. This
// keeps the app on free-tier hosting (no external object store) — submissions
// are size-capped on both the client and the /submit route.
const verifDocSchema = new mongoose.Schema(
  {
    kind: String, // e.g. "Medical degree certificate"
    name: String, // original filename
    mime: String,
    size: Number,
    data: String, // base64 data URL
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["patient", "doctor", "hospital", "admin"],
      default: "patient",
    },
    // For doctor/hospital accounts: the name appointments are booked under,
    // plus a bit of profile context shown on their dashboard.
    providerName: String,
    speciality: String,
    city: String,

    // Provider verification ("KYC") — doctors and hospitals submit credentials
    // and documents, an admin reviews and approves/rejects.
    verification: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
      },
      fields: { type: mongoose.Schema.Types.Mixed, default: {} },
      documents: [verifDocSchema],
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: String,
      rejectionReason: String,
    },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it changed).
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plaintext password against the stored hash.
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
