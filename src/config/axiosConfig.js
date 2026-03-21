import axios from "axios";

const mode = import.meta.env.VITE_APP_MODE || 'development';
const backendURL = mode === 'production' ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV;

const api = axios.create({
  baseURL: backendURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
