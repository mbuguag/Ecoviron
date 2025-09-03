// utils.js

export const BACKEND_URL = "http://localhost:8080";

export const API_BASE = {
  dashboard: `${BACKEND_URL}/api/admin/summary`,
  products: `${BACKEND_URL}/api/admin/products`,
  publicProducts: `${BACKEND_URL}/api/products`,
  orders: `${BACKEND_URL}/api/orders`,
  users: `${BACKEND_URL}/api/users`,
  blogs: `${BACKEND_URL}/api/admin-blogs`,
  quotes: `${BACKEND_URL}/api/admin/quotes`,
  uploadImage: `${BACKEND_URL}/api/images/blog`,
  contactMessages: `${BACKEND_URL}/api/contact/admin/messages`,
};

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found for authenticated request");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type");
  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text(); // fallback
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

