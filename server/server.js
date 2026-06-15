require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./Routes/authRoutes");
const dataRoutes = require("./Routes/dataRoutes");
const appointmentRoutes = require("./Routes/appointmentRoutes");
const aiRoutes = require("./Routes/aiRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("HealthKeeper API running 🩺");
});

// MongoDB connection (only if a URI is configured; the catalog/AI still work without it)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected 🚀"))
    .catch((err) => console.log("DB error:", err.message));
} else {
  console.log("⚠  MONGO_URI not set — login & appointments need a database.");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
