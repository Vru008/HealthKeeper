// Base URL for the json-server API.
// Override at build time with REACT_APP_API_URL (e.g. in a .env file or on your host).
export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3004";
