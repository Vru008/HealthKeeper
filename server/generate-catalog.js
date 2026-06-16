/**
 * Generates a large, realistic hospital + doctor catalog and writes it to:
 *   - ../src/data/catalog.json   (bundled into the React app — instant, offline)
 *   - ./seed-data.json           (served by the API for parity)
 *
 * Deterministic (seeded) so re-running produces the same data.
 * Run:  node server/generate-catalog.js
 */
const fs = require("fs");
const path = require("path");

// ---- seeded RNG (mulberry32) ----
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(20260615);
const pick = (a) => a[Math.floor(r() * a.length)];
const int = (min, max) => Math.floor(r() * (max - min + 1)) + min;
const round1 = (n) => Math.round(n * 10) / 10;

const cities = [
  "Ahmedabad",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Chandigarh",
];

const specialities = [
  { key: "Cardiology", deg: "DM (Cardiology)", focus: ["Angioplasty", "Heart Failure", "Pacemaker Implant", "Valve Repair"] },
  { key: "Neurology", deg: "DM (Neurology)", focus: ["Stroke Care", "Epilepsy", "Parkinson's", "Migraine"] },
  { key: "Oncology", deg: "DM (Oncology)", focus: ["Chemotherapy", "Breast Cancer", "Immunotherapy", "Tumor Surgery"] },
  { key: "Orthopedics", deg: "MS (Orthopedics)", focus: ["Knee Replacement", "Spine Surgery", "Sports Injury", "Arthroscopy"] },
  { key: "Pediatrics", deg: "MD (Pediatrics)", focus: ["Newborn Care", "Vaccination", "Child Nutrition", "Asthma"] },
  { key: "Dermatology", deg: "MD (Dermatology)", focus: ["Acne", "Hair Loss", "Psoriasis", "Laser Therapy"] },
  { key: "Gynecology", deg: "MS (OBG)", focus: ["Pregnancy Care", "PCOS", "Infertility", "Laparoscopy"] },
  { key: "Ophthalmology", deg: "MS (Ophthalmology)", focus: ["Cataract", "LASIK", "Glaucoma", "Retina"] },
  { key: "ENT", deg: "MS (ENT)", focus: ["Sinus Surgery", "Hearing Loss", "Tonsillectomy", "Vertigo"] },
  { key: "Urology", deg: "MCh (Urology)", focus: ["Kidney Stones", "Prostate", "Laser Surgery", "Andrology"] },
  { key: "Nephrology", deg: "DM (Nephrology)", focus: ["Dialysis", "Kidney Transplant", "Hypertension", "CKD"] },
  { key: "Gastroenterology", deg: "DM (Gastroenterology)", focus: ["Endoscopy", "Liver Disease", "IBS", "Colonoscopy"] },
  { key: "Pulmonology", deg: "DM (Pulmonology)", focus: ["Asthma", "COPD", "Sleep Apnea", "TB Care"] },
  { key: "Psychiatry", deg: "MD (Psychiatry)", focus: ["Depression", "Anxiety", "Addiction", "Therapy"] },
  { key: "Dentistry", deg: "MDS", focus: ["Root Canal", "Implants", "Braces", "Whitening"] },
  { key: "General Medicine", deg: "MD (Medicine)", focus: ["Diabetes", "Thyroid", "Fever", "Checkups"] },
];

const firstM = ["Arjun", "Rahul", "Vikram", "Anand", "Sanjay", "Rohit", "Amit", "Karan", "Nikhil", "Manish", "Suresh", "Deepak", "Rajesh", "Aditya", "Pranav", "Gaurav"];
const firstF = ["Priya", "Neha", "Anjali", "Kavita", "Sunita", "Pooja", "Divya", "Shreya", "Meera", "Ritu", "Sneha", "Aarti", "Nisha", "Swati", "Isha", "Tanvi"];
const last = ["Sharma", "Patel", "Mehta", "Verma", "Reddy", "Iyer", "Nair", "Gupta", "Singh", "Joshi", "Desai", "Rao", "Kapoor", "Bhat", "Menon", "Shah"];

const hospitalChains = ["Apollo", "Fortis", "Manipal", "Max", "Medanta", "Narayana", "CARE", "Aster", "Columbia Asia", "Global", "Sterling", "Zydus", "Wockhardt", "KIMS"];
const hospitalTypes = ["Hospital", "Super Speciality Hospital", "Medical Centre", "Multispeciality Hospital", "Institute of Medical Sciences"];
const areas = ["Bopal", "Andheri", "Saket", "Whitefield", "Adyar", "Banjara Hills", "Kothrud", "Salt Lake", "Malviya Nagar", "Vesu", "Gomti Nagar", "Sector 22"];
const facilitiesPool = ["24x7 Emergency", "Pharmacy", "ICU", "Ambulance", "Cafeteria", "Free WiFi", "Insurance Desk", "Diagnostic Lab", "Blood Bank", "Parking"];

// Hospital photos (reliable Unsplash CDN, building/medical imagery)
const hospitalImgs = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
  "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80",
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80",
];

function doctorImg(gender, i) {
  const n = i % 99;
  return `https://randomuser.me/api/portraits/${gender === "F" ? "women" : "men"}/${n}.jpg`;
}

// ---------- doctors ----------
const doctors = [];
let dIdx = 0;
for (const city of cities) {
  for (const sp of specialities) {
    for (let k = 0; k < 2; k++) {
      const gender = r() > 0.5 ? "F" : "M";
      const name =
        "Dr. " +
        (gender === "F" ? pick(firstF) : pick(firstM)) +
        " " +
        pick(last);
      const exp = int(5, 32);
      doctors.push({
        id: `d${dIdx + 1}`,
        name,
        speciality: sp.key,
        gender: gender === "F" ? "Female" : "Male",
        qualifications: `MBBS, ${sp.deg}`,
        experience: exp,
        rating: round1(4.1 + r() * 0.8),
        reviews: int(35, 720),
        fee: int(3, 16) * 100,
        focus: sp.focus.slice(0, 3),
        location: city,
        img: doctorImg(gender, dIdx),
        about: `${name} is a ${sp.key.toLowerCase()} specialist in ${city} with ${exp} years of experience, known for patient-first, evidence-based care.`,
      });
      dIdx++;
    }
  }
}

// ---------- hospitals ----------
const hospitals = [];
let hIdx = 0;
for (const city of cities) {
  // 7 hospitals per city
  const cityHospitals = [];
  for (let h = 0; h < 7; h++) {
    const useChain = r() > 0.4;
    const name = useChain
      ? `${pick(hospitalChains)} ${city}`
      : `${city} ${pick(hospitalTypes)}`;
    const facilities = [...facilitiesPool]
      .sort(() => r() - 0.5)
      .slice(0, int(4, 7));
    const priceTier = pick(["Budget", "Mid-range", "Premium"]);
    cityHospitals.push({
      id: `h${hIdx + 1}`,
      name,
      location: city,
      address: `${pick(areas)}, ${city}`,
      rating: round1(4.0 + r() * 0.9),
      reviews: int(120, 4200),
      priceTier,
      insurance: facilities.includes("Insurance Desk") || r() > 0.4,
      facilities,
      specialities: [],
      img: hospitalImgs[hIdx % hospitalImgs.length],
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name + " " + city
      )}`,
    });
    hIdx++;
  }
  // Ensure every speciality is offered by 3 hospitals in this city
  for (const sp of specialities) {
    const shuffled = [...cityHospitals].sort(() => r() - 0.5).slice(0, 3);
    for (const hosp of shuffled) hosp.specialities.push(sp.key);
  }
  hospitals.push(...cityHospitals);
}

const catalog = { hospitals, doctors };

const clientPath = path.join(__dirname, "..", "src", "data", "catalog.json");
const serverPath = path.join(__dirname, "seed-data.json");
fs.mkdirSync(path.dirname(clientPath), { recursive: true });
fs.writeFileSync(clientPath, JSON.stringify(catalog));
fs.writeFileSync(serverPath, JSON.stringify(catalog, null, 0));

console.log(
  `Generated ${doctors.length} doctors and ${hospitals.length} hospitals across ${cities.length} cities and ${specialities.length} specialities.`
);
console.log("Wrote:", clientPath);
console.log("Wrote:", serverPath);
