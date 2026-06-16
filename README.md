# HealthKeeper 🩺

A full-stack healthcare platform where patients discover hospitals and doctors by
city and speciality, book appointments, get calendar reminders, and chat with an
AI health assistant. Built with the **MERN** stack and **Google Gemini**.

![Tech](https://img.shields.io/badge/stack-MERN-2a487f) ![AI](https://img.shields.io/badge/AI-Gemini-4285F4)

---

## ✨ Features

- **Rich catalog** — 380+ doctors and 80+ hospitals across 12 cities and 16
  specialities (photos, ratings, fees, experience, facilities), bundled into the
  app so search works instantly.
- **Smart search & filters** — search by name, filter by city and minimum
  rating, and sort by rating, experience, or fee.
- **Role-based portals** — sign up as **Patient**, **Doctor**, **Hospital**, or
  **Admin**, each with its own dashboard:
  - _Patient_ — books and manages appointments.
  - _Doctor / Hospital_ — sees appointments booked under their name.
  - _Admin_ — platform stats, all users, and all appointments.
- **Email + password accounts** — secure JWT auth (bcrypt-hashed passwords).
- **Appointment booking** — saved to your account, with a confirmation screen.
- **Device reminders** — every booking generates a downloadable **`.ics`
  calendar event with a built-in alarm**, plus an "Add to Google Calendar" link
  and a browser notification — the same way flight/booking apps remind you.
- **My Appointments** — view, add-to-calendar, or cancel your bookings.
- **AI Health Assistant** — a floating chatbot (Google Gemini) that helps users
  understand symptoms and pick the right speciality.
- **AI Tools hub** (`/ai-tools`) — seven Gemini-powered tools:
  - **Symptom Checker** with **emergency detection** (red-flag safety net + alert)
  - **Smart Doctor Match** — natural-language search ("female skin doctor in
    Ahmedabad under ₹1000") → real matching doctors
  - **Medical Report Reader** — upload a PDF/image or paste values → plain-language
    explanation
  - **Hospital Recommender** — by condition, city, budget tier, insurance
  - **Follow-up & Care reminders** — suggested timeline + calendar (.ics) reminders
  - **24/7 Health Assistant chat**
- **Optional email confirmations** — sent via Nodemailer when SMTP is configured.
- Responsive, modern UI with subtle animations.

---

## 🧱 Tech stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React 18 (CRA), React Router 6, Axios, Bootstrap 5          |
| Backend  | Node.js, Express, MongoDB (Mongoose)                        |
| Auth     | JSON Web Tokens, bcryptjs                                   |
| AI       | Google Gemini (`@google/generative-ai`, `gemini-2.5-flash`) |
| Email    | Nodemailer (optional)                                       |

---

## 📁 Project structure

```
healthkeeper/
├── public/                 # static assets (logos, icons, images)
├── src/                    # React app
│   ├── Pages/              # Home, AboutUs, Department, Contact, ConList,
│   │                       #   Appointments, Auth (Login/Register)
│   ├── components/         # Header, Footer, AIChat, dropdowns, Form
│   ├── context/            # AuthContext (login state)
│   ├── utils/              # calendar.js (.ics + reminders)
│   ├── api.js              # axios instance (auto-attaches JWT)
│   └── config.js           # API base URL
├── server/                 # Express + MongoDB API
│   ├── Models/             # User, Appointment
│   ├── Routes/             # auth, data, appointments, ai
│   ├── middleware/         # JWT auth guard
│   ├── utils/              # mailer
│   ├── seed-data.json      # hospital & doctor catalog
│   └── server.js
└── package.json            # client + orchestration scripts
```

---

## 🚀 Getting started

### 1. Install dependencies (client + server)

```bash
npm run setup
```

### 2. Configure the backend

```bash
cp server/.env.example server/.env
```

Then fill in `server/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
GEMINI_API_KEY=your-free-gemini-key      # https://aistudio.google.com/
JWT_SECRET=any-long-random-string
CLIENT_URL=http://localhost:3000
# Optional — appointment confirmation emails:
EMAIL_USER=
EMAIL_PASS=
```

- **MongoDB** (free): https://www.mongodb.com/atlas
- **Gemini key** (free, no card): https://aistudio.google.com/ → "Get API key"

### 3. Run the app (frontend + backend together)

```bash
npm run dev
```

- Web app → http://localhost:3000
- API → http://localhost:5000

> Run them separately with `npm start` (client) and `npm run server` (backend).

---

## 🔌 API overview

| Method | Endpoint                  | Auth | Description                       |
| ------ | ------------------------- | ---- | -------------------------------- |
| POST   | `/api/auth/register`      | —    | Create an account                |
| POST   | `/api/auth/login`         | —    | Log in, returns a JWT            |
| GET    | `/api/auth/me`            | ✓    | Current user                     |
| GET    | `/api/data/hospitals`     | —    | Hospital catalog                 |
| GET    | `/api/data/doctors`       | —    | Doctor catalog                   |
| GET    | `/api/data/specialities`  | —    | Distinct specialities            |
| GET    | `/api/data/locations`     | —    | Distinct cities                  |
| POST   | `/api/appointments`       | ✓    | Book an appointment              |
| GET    | `/api/appointments`       | ✓    | List my appointments             |
| GET    | `/api/appointments/incoming` | doctor/hospital | Appointments booked with me |
| DELETE | `/api/appointments/:id`   | ✓    | Cancel an appointment            |
| GET    | `/api/admin/stats`        | admin | Platform stats                  |
| GET    | `/api/admin/users`        | admin | All users                       |
| GET    | `/api/admin/appointments` | admin | All appointments                |
| POST   | `/api/ai/chat`            | —    | Health assistant chat (Gemini)   |
| POST   | `/api/ai/symptom-check`   | —    | Symptom triage + emergency flag  |
| POST   | `/api/ai/match-doctor`    | —    | NL query → doctor filters        |
| POST   | `/api/ai/recommend-hospital` | — | NL query → hospital filters      |
| POST   | `/api/ai/report`          | —    | Explain a medical report         |
| POST   | `/api/ai/follow-up`       | —    | Follow-up timeline + reminders   |

### Creating an admin account

On the Sign Up page choose **Admin** and enter the admin code (set by
`ADMIN_CODE` in `server/.env`, default `healthkeeper-admin`). Doctor and Hospital
accounts are open self-signup; their dashboards show appointments booked under
the name they register with.

---

## 📦 Deployment notes

- Build the frontend with `npm run build`; host the `build/` folder on any
  static host (Netlify, Vercel, etc.) and set `REACT_APP_API_URL` to your
  deployed API URL.
- Deploy `server/` to any Node host (Render, Railway, etc.) with the same env
  vars. Secrets live only in `.env` and are never committed.

---

Built by **Vruttant Patel**.
