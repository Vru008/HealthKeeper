# HealthKeeper

A healthcare discovery web app built with React. Users can search for hospitals
and doctors by city and speciality, browse departments, read about the service,
and book an appointment. Authentication is handled with Auth0.

## Tech stack

- **React 18** (Create React App) + **React Router 6**
- **Bootstrap 5** for layout and components
- **Auth0** (`@auth0/auth0-react`) for login
- **axios** for data fetching
- **json-server** as a mock REST API (data in `db.json`)

## Getting started

Install dependencies:

```bash
npm install
```

Run the mock API and the React app together:

```bash
npm run dev
```

This starts:

- the API (json-server) at `http://localhost:3004`
- the React dev server at `http://localhost:3000`

You can also run them separately with `npm run server` and `npm start`.

## Configuration

The API base URL lives in `src/config.js` and defaults to
`http://localhost:3004`. Override it for other environments with an env var:

```bash
# .env
REACT_APP_API_URL=https://your-api.example.com
```

## Available scripts

| Script           | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Run the mock API and React app concurrently   |
| `npm start`      | Run the React dev server only                 |
| `npm run server` | Run the json-server mock API only (port 3004) |
| `npm run build`  | Production build into `build/`                |
| `npm test`       | Run tests                                     |

## Project structure

```
src/
  Pages/          Route-level pages (Home, AboutUs, Department, Contact, ConList)
  components/
    common/       Shared UI (Header, Footer, Form, ScrollToTop)
    SpecialityList.js, LocationList.js   Data-driven dropdowns
  Assets/         Hospital and doctor images used in the results list
  config.js       API base URL
db.json           Mock data (hospitals, doctors, appointments)
```
