// Base URL for the HealthKeeper backend API.
// Override at build time with REACT_APP_API_URL (e.g. your deployed API).
export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
