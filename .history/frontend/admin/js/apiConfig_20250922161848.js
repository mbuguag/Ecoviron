// apiconfig.js

// ---------------------------
// 🔹 Environment Detection
// ---------------------------
const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const isPreviewEnv = window.location.hostname.includes("vercel.app");

// ---------------------------
// 🔹 Environment Config
// ---------------------------
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api",
  },
  static: {
    local: "http://localhost:3000",
    preview: "https://your-preview-domain.vercel.app",
    production: "https://www.bionix-hse.co.ke",
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/",
  },
};

// ---------------------------
// 🔹 Resolved Base URLs
// ---------------------------
export const API_BASE_URL = isLocalDev
  ? ENV_CONFIG.api.local
  : isPreviewEnv
  ? ENV_CONFIG.api.preview
  : ENV_CONFIG.api.production;

export const STATIC_BASE_URL = isLocalDev
  ? ENV_CONFIG.static.local
  : isPreviewEnv
  ? ENV_CONFIG.static.preview
  : ENV_CONFIG.static.production;

export const BASE_PATH = isLocalDev
  ? ENV_CONFIG.basePath.local
  : isPreviewEnv
  ? ENV_CONFIG.basePath.preview
  : ENV_CONFIG.basePath.production;

// ---------------------------
// 🔹 Utility: Price Formatter
// ---------------------------
export function formatPrice(amount, currency = "KES") {
  if (isNaN(amount)) {
    console.warn("Invalid amount for formatPrice:", amount);
    return `${currency} 0.00`;
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------
// 🔹 API Endpoints
// ---------------------------
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  users: `${API_BASE_URL}/users`,
  profile: `${API_BASE_URL}/users/profile`,

  admin: {
    dashboard: `${API_BASE_URL}/admin/summary`,
    users: `${API_BASE_URL}/admin/users`,
    products: `${API_BASE_URL}/admin/products`,
    blogs: `${API_BASE_URL}/admin/blogs`,
    quotes: `${API_BASE_URL}/admin/quotes`,
    contactMessages: `${API_BASE_URL}/contact/admin/messages`,
  },

  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
  orders: `${API_BASE_URL}/orders`,
  blogs: `${API_BASE_URL}/blogs`,
  newsletter: `${API_BASE_URL}/newsletter`,
};

// ---------------------------
// 🔹 Auth Fetch Wrapper
// ---------------------------
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ No token found, redirecting to login.");
    window.location.href = "/admin/admin-login.html";
    return Promise.reject("No token");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // Only set JSON Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem("token");
      alert("Session expired. Please log in again.");
      window.location.href = "/admin/admin-login.html";
      throw new Error("Unauthorized");
    }

    return response;
  } catch (err) {
    console.error("❌ authFetch error:", err);
    throw err;
  }
}

// ---------------------------
// 🔹 Helpers for API Responses
// ---------------------------
export async function fetchJson(url, options = {}) {
  const res = await authFetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function fetchText(url, options = {}) {
  const res = await authFetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.text();
}

// ---------------------------
// 🔹 Debug (only local/preview)
// ---------------------------
if (isLocalDev || isPreviewEnv) {
  console.log("🔧 Environment Info:", {
    isLocalDev,
    isPreviewEnv,
    BASE_PATH,
    API_BASE_URL,
    STATIC_BASE_URL,
  });
}
