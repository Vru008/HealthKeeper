const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Hospitals & doctors are static reference data — served straight from the
// bundled JSON so the catalog works even before a database is configured.
let catalog = { hospitals: [], doctors: [] };
try {
  const raw = fs.readFileSync(
    path.join(__dirname, "..", "seed-data.json"),
    "utf-8"
  );
  const parsed = JSON.parse(raw);
  catalog.hospitals = parsed.hospitals || [];
  catalog.doctors = parsed.doctors || [];
} catch (err) {
  console.log("Could not load seed-data.json:", err.message);
}

const unique = (arr) => [...new Set(arr.filter(Boolean))];

// GET /api/data/hospitals
router.get("/hospitals", (req, res) => res.json(catalog.hospitals));

// GET /api/data/doctors
router.get("/doctors", (req, res) => res.json(catalog.doctors));

// GET /api/data/specialities  → distinct specialities for the dropdown
router.get("/specialities", (req, res) =>
  res.json(unique(catalog.doctors.map((d) => d.speciality)))
);

// GET /api/data/locations  → distinct cities for the dropdown
router.get("/locations", (req, res) =>
  res.json(unique(catalog.hospitals.map((h) => h.location)))
);

module.exports = router;
