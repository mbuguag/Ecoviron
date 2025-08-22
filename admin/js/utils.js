
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
  if (!token) {
    window.location.href = "/login.html";
    return Promise.reject("No token found");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Only add Content-Type if it's NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}



