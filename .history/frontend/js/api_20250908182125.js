import { API_BASE_URL } from "./apiConfig.js";

/**
 * Generic fetch wrapper with environment-aware API_BASE_URL
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("jwtToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Read body once
  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = raw;
  }

  if (!res.ok) {
    const errorMsg =
      (data && data.message) || (typeof data === "string" ? data : res.statusText);
    throw new Error(errorMsg || `Request failed: ${res.status}`);
  }

  return data;
}

/**
 * Product APIs
 */
export function fetchAllProducts() {
  return apiRequest("/products");
}

export function fetchProductById(id) {
  return apiRequest(`/products/${id}`);
}

/**
 * Order APIs
 */
export function submitOrder(orderData) {
  return apiRequest("/orders/save", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

/**
 * Auth APIs
 */
export function login(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function register(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function fetchUserProfile() {
  return apiRequest("/users/me");
}
