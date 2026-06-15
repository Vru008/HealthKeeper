/**
 * Optional helper: clears demo Users and Appointments.
 * Hospitals & doctors are reference data served from seed-data.json,
 * so they don't need seeding. Run with: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./Models/User");
const Appointment = require("./Models/Appointment");

(async () => {
  if (!process.env.MONGO_URI) {
    console.log("Set MONGO_URI in server/.env first.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  await Appointment.deleteMany({});
  console.log("Cleared appointments. Users left intact.");
  await mongoose.disconnect();
  process.exit(0);
})();
