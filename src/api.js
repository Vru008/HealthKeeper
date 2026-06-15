import axios from "axios";
import { API_BASE } from "./config";

// Single axios instance for the whole app. It automatically attaches the
// logged-in user's JWT (stored in localStorage) to every request.
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hk_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
