import axios from "axios";

const mode = (import.meta as any).env.VITE_APP_MODE || 'development';
const backendURL = mode === 'production' ? (import.meta as any).env.VITE_BACKEND_URL_PROD : (import.meta as any).env.VITE_BACKEND_URL_DEV;

const api = axios.create({
  baseURL: backendURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
