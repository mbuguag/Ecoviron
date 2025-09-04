// frontend/js/api.js
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

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.status}`;
    try {
      const error = await res.json();
      errorMsg = error.message || JSON.stringify(error);
    } catch (_) {
      errorMsg = await res.text();
    }
    throw new Error(errorMsg);
  }

  // Attempt to parse JSON, fallback to text
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
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
