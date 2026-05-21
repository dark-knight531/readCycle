import axios from "axios";

const TOKEN_KEY = "readCycle_accessToken";

export const API_ORIGIN =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

const API = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }
  return config;
});

export default API;
