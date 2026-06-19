<p align="center">
  <img src="./public/og-image.png" alt="HealthKeeper" width="640" />
</p>

<h1 align="center">HealthKeeper 🩺</h1>

<p align="center">
  <em>A full-stack, AI-powered healthcare platform — discover doctors & hospitals, book appointments,
  track your family's health records with consent-based sharing, and get AI guidance, in real time.</em>
</p>

<p align="center">
  <a href="https://health-keeper-fmq4.vercel.app"><b>🌐 Live demo</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/Vru008/HealthKeeper"><b>💻 Repository</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stack-MERN-2a487f" alt="MERN" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4" alt="Gemini" />
  <img src="https://img.shields.io/badge/realtime-Socket.io-010101" alt="Socket.io" />
  <img src="https://img.shields.io/badge/auth-JWT-orange" alt="JWT" />
</p>

> **Note on data:** the doctor/hospital catalog and their statistics are **synthetic, illustrative demo data** generated for this portfolio project — not real medical information. The engineering (auth, consent, records, realtime, AI) is production-shaped.

---

## ✨ What it does

HealthKeeper is built around **four roles** (Patient, Doctor, Hospital, Admin) sharing one platform, where what each person sees is governed by their role **and** by patient consent.

### For patients
- **Discover & book** — search 1,150+ doctors and 250+ hospitals across 36 cities by name, speciality, city, rating, and price; hospital ranking by per-speciality success; **Google Maps directions** to each facility.
- **Appointments** — book, manage, and get reminders via a downloadable **`.ics` calendar event**, an "Add to Google Calendar" link, and browser notifications.
- **AI Tools** (Gemini, voice + **English / Hindi / Gujarati**):
  - **Symptom Checker** with a rule-based **emergency safety net** (red-flag detection → "Call 108" + nearest hospitals, works even if the AI is rate-limited)
  - **Smart Doctor Match** — natural language ("female skin doctor in Ahmedabad under ₹1000") → real results
  - **Medical Report Reader** — upload a PDF/image → plain-language explanation
  - **Hospital Recommender**, **Cost Estimator** (govt/private/premium ranges with budget-matched hospitals), **Journey Planner**, **Follow-up reminders**
- **Health Copilot** — track vitals (BP, sugar, HbA1c, weight) with a rule-based **Health Score** and risk flags.
- **Health Records** — keep records in one place; **patient-controlled sharing** with granular `view`/`add` permissions; an **access log** of exactly who viewed your data; **family records** for dependents under one account.
- **Care plans & alerts** — see treatment timelines a provider posts, with **real-time** notifications.

### For doctors & hospitals
- A portal with **appointments**, a **message inbox** (Inbox/Sent/Archived, reply/archive/assign), a **patient search** over everyone who shared records, **care-plan management**, and **KYC verification** (upload credentials & documents for admin review).

### For admins
- A back-office **console**: platform stats, full **user CRUD**, **verification reviews**, and all appointments.

---

## 🔐 Security & privacy model

A core focus of the project — and a good talking point for healthcare software:

- **JWT auth** with bcrypt-hashed passwords and **role-based access control** on every route.
- **Patient-controlled consent** — a doctor/hospital can only read or add a patient's records with an active, granular grant the patient can revoke anytime.
- **Append-only audit log** — every record view/add and every grant/revoke is recorded and visible to the patient.
- **Forgot/reset password** — time-limited, single-use, SHA-256-hashed tokens; the endpoint never reveals whether an account exists (no user enumeration).
- Secrets live only in `.env`; the AI assistant and catalog work without exposing keys to the client.

---

## 🧱 Tech stack

| Layer     | Tech                                                                 |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React 18 (CRA), React Router 6, Axios, React Context, Bootstrap 5   |
| Backend   | Node.js, Express, MongoDB (Mongoose)                                |
| Realtime  | Socket.io (live alerts, message badges, online presence)            |
| Auth      | JSON Web Tokens, bcryptjs                                            |
| AI        | Google Gemini (`@google/generative-ai`, `gemini-2.5-flash-lite`)    |
| Voice/i18n| Browser Web Speech API (STT + TTS) — English, Hindi, Gujarati       |
| Email     | Nodemailer (optional)                                               |
| Hosting   | Vercel (frontend) · Render (backend) · MongoDB Atlas                |

---

## 🗺️ Architecture

```
Roles (Patient · Doctor · Hospital · Admin)
        │  HTTPS + JWT
        ▼
React frontend (Vercel) ──── REST /api ────►  Express API (Render)
        │                                       │  JWT auth · RBAC ·
        └──── ⚡ Socket.io (live) ──────────────┤  consent gating · audit
                                                ▼
                              MongoDB Atlas  +  Gemini AI · Maps · Email
```

Catalog doctors/hospitals are **not** user accounts; appointments, messages and consent route to a provider's dashboard by **name** (`providerName`), the single convention that ties the system together.

---

## 📁 Project structure

```
healthkeeper/
├── public/                  # static assets, branded favicons + og-image, catalog.json
├── src/                     # React app
│   ├── Pages/               # Home, AboutUs, Department, Contact, ConList,
│   │                        #   AITools, Profile, Appointments, Health (Copilot),
│   │                        #   Records, Verification, Auth (Login/Register/Forgot/Reset),
│   │                        #   Dashboard (Provider, Admin, Messages, PatientsPanel)
│   ├── components/          # Header, Footer, AIChat, SearchableSelect, SpeakButton…
│   ├── context/             # Auth, Catalog, Toast, Socket
│   ├── hooks/               # useVoice (STT/TTS)
│   ├── utils/               # calendar (.ics), maps
│   ├── api.js               # axios instance (auto-attaches JWT)
│   └── config.js            # API + socket base URLs
└── server/                  # Express + MongoDB API
    ├── Models/              # User, Appointment, Vital, Message, HealthRecord,
    │                        #   Consent, AuditLog, Treatment, Notification, FamilyMember
    ├── Routes/              # auth, data, appointments, ai, vitals, messages,
    │                        #   verification, records, treatments, notifications, admin
    ├── middleware/          # JWT auth guard + role gate
    ├── realtime.js          # Socket.io server (rooms, presence, emitters)
    ├── generate-catalog.js  # builds the synthetic catalog
    └── server.js
```

---

## 🚀 Getting started

```bash
# 1. Install client + server deps
npm run setup

# 2. Configure the backend
cp server/.env.example server/.env
```

Fill in `server/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
GEMINI_API_KEY=your-free-gemini-key        # https://aistudio.google.com/
GEMINI_MODEL=gemini-2.5-flash-lite          # optional override
JWT_SECRET=any-long-random-string
CLIENT_URL=http://localhost:3000            # used in password-reset links
ADMIN_CODE=choose-an-admin-signup-code      # required to register an admin
# Optional — confirmation & reset emails:
EMAIL_USER=
EMAIL_PASS=
```

- **MongoDB** (free): https://www.mongodb.com/atlas
- **Gemini key** (free, no card): https://aistudio.google.com/ → "Get API key"

```bash
# 3. Run frontend + backend together
npm run dev      # web → http://localhost:3000 · API → http://localhost:5000
```

> Run them separately with `npm start` (client) and `npm run server` (backend).

---

## 🔌 API overview (selected)

| Area          | Endpoints |
| ------------- | --------- |
| **Auth**      | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `POST /auth/forgot` · `POST /auth/reset` |
| **Catalog**   | `GET /data/doctors` · `GET /data/hospitals` · `GET /data/specialities` |
| **Appointments** | `POST /appointments` · `GET /appointments` · `GET /appointments/incoming` |
| **AI**        | `POST /ai/symptom-check` · `/ai/match-doctor` · `/ai/report` · `/ai/cost-estimate` · `/ai/chat` |
| **Vitals**    | `GET /vitals` · `POST /vitals` |
| **Messages**  | `POST /messages/send` · `GET /messages/incoming` · `PATCH /messages/:id/reply` |
| **Records**   | `GET /records/mine` · `POST /records` · `POST /records/consents` · `GET /records/patients?q=` · `GET /records/audit` · `GET/POST /records/family` |
| **Treatments**| `GET /treatments/mine` · `POST /treatments/patient/:id` · `POST /treatments/:id/update` |
| **Verification** | `POST /verification/submit` · `GET /verification/pending` · `PATCH /verification/:id/review` |
| **Admin**     | `GET /admin/stats` · `GET /admin/users` · `PATCH /admin/users/:id` |

All write/record routes are JWT-protected and, where relevant, **consent- and role-gated**.

---

## 📦 Deployment

- **Frontend** → Vercel. Set `REACT_APP_API_URL` to your deployed API URL (e.g. `https://your-api.onrender.com/api`).
- **Backend** → Render (root dir `server`, start `node server.js`) with the env vars above (`CLIENT_URL` = your Vercel URL so reset links and Socket.io resolve correctly).
- **Database** → MongoDB Atlas (whitelist your host's IP).

---

## 🧭 Roadmap

- At-rest field encryption + **FHIR** interoperability for cross-provider exchange.
- Real-time chat (patient ↔ provider) on the existing Socket.io layer.
- Automated test suite + CI.

---

Built by **Vruttant Patel** · [Live demo](https://health-keeper-fmq4.vercel.app)
