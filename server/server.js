require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/authRoutes");
const dataRoutes = require("./Routes/dataRoutes");
const appointmentRoutes = require("./Routes/appointmentRoutes");
const vitalRoutes = require("./Routes/vitalRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const verificationRoutes = require("./Routes/verificationRoutes");
const recordRoutes = require("./Routes/recordRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const aiRoutes = require("./Routes/aiRoutes");
const { protect } = require("./middleware/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---- MongoDB connection ----
// The catalog (/api/data) and AI assistant work without a database; login and
// appointments need one. We fail fast and loud so misconfig is obvious.
mongoose.set("strictQuery", true);
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      console.error(
        "   Fix: in MongoDB Atlas, allow your IP (Network Access → Add IP → 0.0.0.0/0),\n" +
          "   make sure the cluster is running, and check the password / db name in MONGO_URI."
      );
    });
  mongoose.connection.on("disconnected", () =>
    console.warn("⚠  MongoDB disconnected")
  );
} else {
  console.warn("⚠  MONGO_URI not set — login & appointments need a database.");
}

// Returns a clear error immediately if the DB isn't connected, instead of
// letting Mongoose buffer the query for 10s and throw a cryptic timeout.
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error:
        "Database not connected. Set MONGO_URI in server/.env and whitelist your IP in MongoDB Atlas.",
    });
  }
  next();
};

// Routes
app.use("/api/auth", requireDB, authRoutes);
app.use("/api/data", dataRoutes); // static catalog — no DB needed
app.use("/api/appointments", requireDB, appointmentRoutes);
app.use("/api/vitals", requireDB, vitalRoutes);
app.use("/api/messages", requireDB, messageRoutes); // /send is public; rest are protected
app.use("/api/verification", requireDB, verificationRoutes);
app.use("/api/records", requireDB, recordRoutes);
app.use("/api/admin", requireDB, adminRoutes);
app.use("/api/ai", requireDB, protect, aiRoutes); // logged-in users only

// Health check
app.get("/", (req, res) => {
  res.send("HealthKeeper API running 🩺");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
