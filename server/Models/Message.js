const mongoose = require("mongoose");

// A message sent from the Contact page to a specific doctor or hospital.
// Catalog doctors/hospitals are not User accounts, so — exactly like
// appointments — a message is routed to a provider dashboard by NAME
// (receiverName === user.providerName || user.name). receiverId keeps the
// catalog id for reference/deep-linking.
const replySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true, lowercase: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },

    receiverType: { type: String, enum: ["doctor", "hospital"], required: true },
    receiverId: { type: String, required: true }, // catalog id, e.g. "d1" / "h1"
    receiverName: { type: String, required: true }, // used to route to the dashboard
    receiverSpeciality: String, // doctor speciality (denormalized for display)
    receiverCity: String,

    senderType: { type: String, enum: ["guest", "patient"], default: "guest" },
    senderUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
    archived: { type: Boolean, default: false },
    assignedDepartment: String, // hospital admins can route to a department
    replies: [replySchema],
  },
  { timestamps: true }
);

// Provider dashboards query by type + name a lot.
messageSchema.index({ receiverType: 1, receiverName: 1, archived: 1, status: 1 });

module.exports = mongoose.model("Message", messageSchema);
