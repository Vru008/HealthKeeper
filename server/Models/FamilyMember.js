const mongoose = require("mongoose");

// A dependent/family member managed under a patient's account. Health records
// can be tagged to a member (or left untagged = the account holder themselves),
// so one login can keep records for the whole family.
const familyMemberSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    relation: String, // Spouse, Child, Parent, Sibling, Other
    gender: String,
    dob: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyMember", familyMemberSchema);
