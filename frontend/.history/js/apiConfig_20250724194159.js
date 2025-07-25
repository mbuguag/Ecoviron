const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocalDev
  ? "http://localhost:8080/api"
  : "https://your-live-api.com/api";

// Serve from root if running via Live Server in frontend/
const isServedFromProjectRoot = window.location.pathname.includes("/frontend/");

export const BASE_PATH = isServedFromProjectRoot ? "/frontend/" : "/";