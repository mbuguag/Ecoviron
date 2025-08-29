// utils.js
import { API_BASE_URL } from "./apiConfig.js";

// Derive BACKEND_URL (strip `/api`)
export const BACKEND_URL = API_BASE_URL.replace("/api", "");

// Centralized endpoints
export const API_BASE = {
  dashboard: `${API_BASE_URL}/admin/summary`,
  products: `${API_BASE_URL}/admin/products`,
  publicProducts: `${API_BASE_URL}/products`,
  orders: `${API_BASE_URL}/orders`,
  users: `${API_BASE_URL}/users`,
  blogs: `${API_BASE_URL}/admin-blogs`,
  quotes: `${API_BASE_URL}/admin/quotes`,
  uploadImage: `${API_BASE_URL}/images/blog`,
  contactMessages: `${API_BASE_URL}/contact/admin/messages`,
  // ✅ Explicit image serving base (so previews & assets resolve cleanly)
  images: `${BACKEND_URL}/uploads/images`,
};

// ✅ authFetch wrapper
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return Promise.reject("No token found");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Only add Content-Type if NOT uploading FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
