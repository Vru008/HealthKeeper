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

// Real Indian cities with real localities and pincode prefixes, so generated
// addresses read as authentic (e.g. "Bopal, Ahmedabad - 380058").
const CITY_DATA = {
  Ahmedabad: { pin: "380", areas: ["Bopal", "Satellite", "Navrangpura", "Maninagar", "Vastrapur"] },
  Mumbai: { pin: "400", areas: ["Andheri", "Bandra", "Powai", "Dadar", "Mulund"] },
  Delhi: { pin: "110", areas: ["Saket", "Dwarka", "Rohini", "Vasant Kunj", "Pitampura"] },
  Bangalore: { pin: "560", areas: ["Whitefield", "Indiranagar", "Jayanagar", "Koramangala", "Marathahalli"] },
  Chennai: { pin: "600", areas: ["Adyar", "T. Nagar", "Velachery", "Anna Nagar", "Mylapore"] },
  Hyderabad: { pin: "500", areas: ["Banjara Hills", "Gachibowli", "Madhapur", "Jubilee Hills", "Kukatpally"] },
  Pune: { pin: "411", areas: ["Kothrud", "Hinjewadi", "Baner", "Viman Nagar", "Kharadi"] },
  Kolkata: { pin: "700", areas: ["Salt Lake", "Ballygunge", "New Town", "Behala", "Howrah"] },
  Jaipur: { pin: "302", areas: ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar", "Tonk Road"] },
  Surat: { pin: "395", areas: ["Vesu", "Adajan", "Athwa", "Piplod", "Citylight"] },
  Lucknow: { pin: "226", areas: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Aminabad"] },
  Chandigarh: { pin: "160", areas: ["Sector 17", "Sector 22", "Sector 35", "Sector 44", "Manimajra"] },
  Vadodara: { pin: "390", areas: ["Alkapuri", "Gotri", "Akota", "Sayajigunj", "Fatehgunj"] },
  Indore: { pin: "452", areas: ["Vijay Nagar", "Palasia", "Rau", "Bhawarkua", "Sudama Nagar"] },
  Bhopal: { pin: "462", areas: ["MP Nagar", "Arera Colony", "Kolar Road", "Shahpura", "New Market"] },
  Nagpur: { pin: "440", areas: ["Dharampeth", "Sadar", "Ramdaspeth", "Wardha Road", "Civil Lines"] },
  Patna: { pin: "800", areas: ["Kankarbagh", "Boring Road", "Patliputra", "Rajendra Nagar", "Bailey Road"] },
  Kanpur: { pin: "208", areas: ["Swaroop Nagar", "Kakadeo", "Civil Lines", "Kidwai Nagar", "Govind Nagar"] },
  Coimbatore: { pin: "641", areas: ["RS Puram", "Gandhipuram", "Saibaba Colony", "Peelamedu", "Race Course"] },
  Kochi: { pin: "682", areas: ["Kakkanad", "Edappally", "Vyttila", "Kaloor", "Palarivattom"] },
  Visakhapatnam: { pin: "530", areas: ["MVP Colony", "Dwaraka Nagar", "Gajuwaka", "Madhurawada", "Seethammadhara"] },
  Bhubaneswar: { pin: "751", areas: ["Saheed Nagar", "Patia", "Chandrasekharpur", "Jaydev Vihar", "Khandagiri"] },
  Guwahati: { pin: "781", areas: ["Zoo Road", "Beltola", "Dispur", "Paltan Bazaar", "Six Mile"] },
  Ranchi: { pin: "834", areas: ["Lalpur", "Kanke Road", "Harmu", "Doranda", "Ashok Nagar"] },
  Raipur: { pin: "492", areas: ["Shankar Nagar", "Pandri", "Telibandha", "Devendra Nagar", "Samta Colony"] },
  Dehradun: { pin: "248", areas: ["Rajpur Road", "Clement Town", "Ballupur", "Sahastradhara Road", "Race Course"] },
  Amritsar: { pin: "143", areas: ["Ranjit Avenue", "Lawrence Road", "Mall Road", "Majitha Road", "Green Avenue"] },
  Ludhiana: { pin: "141", areas: ["Sarabha Nagar", "Model Town", "Civil Lines", "Dugri", "BRS Nagar"] },
  Vijayawada: { pin: "520", areas: ["Benz Circle", "Governorpet", "Patamata", "Auto Nagar", "Gunadala"] },
  Mysore: { pin: "570", areas: ["Vijayanagar", "Saraswathipuram", "Kuvempunagar", "Gokulam", "Hebbal"] },
  Nashik: { pin: "422", areas: ["College Road", "Gangapur Road", "Indira Nagar", "Panchavati", "Nashik Road"] },
  Rajkot: { pin: "360", areas: ["Kalavad Road", "University Road", "Race Course", "Kotecha Nagar", "Gondal Road"] },
  Gurgaon: { pin: "122", areas: ["DLF Phase 1", "Sushant Lok", "Sohna Road", "Golf Course Road", "Sector 56"] },
  Noida: { pin: "201", areas: ["Sector 18", "Sector 62", "Sector 137", "Sector 50", "Sector 76"] },
  Thiruvananthapuram: { pin: "695", areas: ["Kowdiar", "Pattom", "Vazhuthacaud", "Sasthamangalam", "Technopark"] },
  Mangalore: { pin: "575", areas: ["Hampankatta", "Kadri", "Bejai", "Kankanady", "Surathkal"] },
};
const cities = Object.keys(CITY_DATA);

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
const cityAddress = (city) => {
  const info = CITY_DATA[city];
  const pincode = info.pin + String(int(0, 999)).padStart(3, "0");
  return `${pick(info.areas)}, ${city} - ${pincode}`;
};
const facilitiesPool = ["24x7 Emergency", "Pharmacy", "ICU", "Ambulance", "Cafeteria", "Free WiFi", "Insurance Desk", "Diagnostic Lab", "Blood Bank", "Parking"];

// ---- achievement / outcome pools ----
const awardsPool = [
  "National Excellence Award",
  "State Best Doctor Award",
  "Healthcare Innovation Award",
  "Young Achiever Award",
  "Lifetime Service Award",
  "Patient Choice Award",
];
const certPool = [
  "Board Certified",
  "Fellowship (UK)",
  "Fellowship (USA)",
  "Member, Indian Medical Association",
  "Advanced Laparoscopy Certified",
  "ACLS / BLS Certified",
];
const collegePool = [
  "AIIMS Delhi",
  "CMC Vellore",
  "KEM Hospital, Mumbai",
  "PGIMER Chandigarh",
  "JIPMER Puducherry",
  "Grant Medical College",
  "B.J. Medical College",
  "Maulana Azad Medical College",
];
const langExtra = ["Gujarati", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Punjabi", "Malayalam"];
const doctorLangs = () => {
  const base = ["English", "Hindi"];
  if (r() > 0.35) base.push(pick(langExtra));
  return base;
};
const sample = (arr, n) => [...arr].sort(() => r() - 0.5).slice(0, n);

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
        // Treatment Success Intelligence + Achievement Engine
        successRate: round1(88 + r() * 11),
        procedures: int(200, 6000),
        complicationRate: round1(0.8 + r() * 4),
        recoveryDays: int(4, 28),
        satisfaction: round1(4 + r() * 0.99),
        publications: int(0, 24),
        totalConsultations: int(1500, 42000),
        languages: doctorLangs(),
        awards: r() > 0.45 ? [pick(awardsPool)] : [],
        certifications: sample(certPool, int(1, 3)),
        education: `MBBS — ${pick(collegePool)} · ${sp.deg} — ${pick(collegePool)}`,
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
    const address = cityAddress(city);
    cityHospitals.push({
      id: `h${hIdx + 1}`,
      name,
      location: city,
      address,
      rating: round1(4.0 + r() * 0.9),
      reviews: int(120, 4200),
      priceTier,
      insurance: facilities.includes("Insurance Desk") || r() > 0.4,
      facilities,
      specialities: [],
      specialityRates: {},
      successRate: round1(90 + r() * 9),
      waitingTime: pick(["No wait", "~15 min", "~30 min", "~45 min"]),
      beds: { total: int(80, 900), icu: int(8, 90) },
      established: int(1975, 2018),
      img: hospitalImgs[hIdx % hospitalImgs.length],
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name + ", " + address
      )}`,
    });
    hIdx++;
  }
  // Ensure every speciality is offered by 3 hospitals in this city
  for (const sp of specialities) {
    const shuffled = [...cityHospitals].sort(() => r() - 0.5).slice(0, 3);
    for (const hosp of shuffled) {
      hosp.specialities.push(sp.key);
      hosp.specialityRates[sp.key] = round1(89 + r() * 10); // per-speciality success %
    }
  }
  hospitals.push(...cityHospitals);
}

// Drop the unused 'about' blurb to keep the payload small.
const catalog = {
  hospitals,
  doctors: doctors.map(({ about, ...rest }) => rest),
};

const uniq = (a) => [...new Set(a.filter(Boolean))];
const lists = {
  specialities: uniq(catalog.doctors.map((d) => d.speciality)).sort(),
  locations: uniq(hospitals.map((h) => h.location)).sort(),
  doctorCount: catalog.doctors.length,
  hospitalCount: hospitals.length,
};

// Full catalog is fetched at runtime from public/ (kept out of the JS bundle).
const publicPath = path.join(__dirname, "..", "public", "catalog.json");
const serverPath = path.join(__dirname, "seed-data.json");
// Tiny lists are bundled (specialities, cities, counts) for instant dropdowns.
const listsPath = path.join(__dirname, "..", "src", "data", "lists.json");

fs.mkdirSync(path.dirname(publicPath), { recursive: true });
fs.mkdirSync(path.dirname(listsPath), { recursive: true });
fs.writeFileSync(publicPath, JSON.stringify(catalog));
fs.writeFileSync(serverPath, JSON.stringify(catalog));
fs.writeFileSync(listsPath, JSON.stringify(lists, null, 2));

console.log(
  `Generated ${catalog.doctors.length} doctors and ${hospitals.length} hospitals across ${cities.length} cities and ${specialities.length} specialities.`
);
console.log("Wrote:", publicPath);
console.log("Wrote:", serverPath);
console.log("Wrote:", listsPath);
