# Deploying HealthKeeper (100% free)

Three free services, no credit card:

| Part      | Host                         | Cost |
| --------- | ---------------------------- | ---- |
| Database  | MongoDB Atlas (already used) | Free |
| Backend   | Render — Web Service         | Free |
| Frontend  | Vercel (or Netlify)          | Free |

> Heads-up: Render's free web service **sleeps after ~15 min of inactivity**, so
> the first request after idle takes ~30–50s to wake up. That's normal on the
> free tier.

---

## 1. MongoDB Atlas (done)

You already have this. Just make sure **Network Access → IP** includes
`0.0.0.0/0` (allow from anywhere) so the deployed backend can connect.

---

## 2. Backend → Render

1. Go to https://render.com → sign up with **GitHub** (free).
2. **New → Web Service** → connect the **Vru008/HealthKeeper** repo.
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
4. Add **Environment Variables** (from your local `server/.env`):
   | Key | Value |
   | --- | ----- |
   | `MONGO_URI` | your Atlas connection string (db name `healthkeeper`) |
   | `GEMINI_API_KEY` | your Gemini key |
   | `JWT_SECRET` | any long random string |
   | `ADMIN_CODE` | your admin signup code |
   | `CLIENT_URL` | (fill in after step 3 — your Vercel URL) |
   | `EMAIL_USER` / `EMAIL_PASS` | optional (Gmail app password) |
5. **Create Web Service.** When it's live, copy the URL,
   e.g. `https://healthkeeper-api.onrender.com`.
6. Test it: open `https://<your-render-url>/` — it should say
   `HealthKeeper API running 🩺`.

---

## 3. Frontend → Vercel

1. Go to https://vercel.com → sign up with **GitHub** (free).
2. **Add New → Project** → import **Vru008/HealthKeeper**.
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (repo root)
4. Add **Environment Variable**:
   | Key | Value |
   | --- | ----- |
   | `REACT_APP_API_URL` | `https://<your-render-url>/api` |
   (Use the Render URL from step 2, with `/api` on the end.)
5. **Deploy.** You'll get a URL like `https://healthkeeper.vercel.app`.

> `vercel.json` (already in the repo) handles client-side routing, so refreshing
> on `/department`, `/ai-tools`, etc. works. The catalog is served statically
> from `/catalog.json`.

---

## 4. Link them up

1. Back in **Render → your service → Environment**, set
   `CLIENT_URL` to your Vercel URL and **Save** (it redeploys).
2. Open your Vercel URL and test: sign up, search, book an appointment, AI tools.

That's it — your full-stack app is live. 🎉

### Redeploys

Both Render and Vercel **auto-deploy on every push to `main`**, so future
changes go live automatically.
