
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

// In your authFetch function, ensure you're sending the token properly:
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login if no token
    window.location.href = '/login.html';
    return Promise.reject("No token found");
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  return fetch(url, { ...options, headers });
}


