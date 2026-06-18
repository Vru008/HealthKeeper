const mongoose = require("mongoose");

// A lightweight in-app alert for a user (currently patients). Created when a
// provider starts a care plan or posts an update, so the patient is notified.
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, default: "info" }, // "treatment", "update", "info"
    title: { type: String, required: true },
    body: String,
    link: String, // in-app route the alert points to, e.g. "/records"
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
