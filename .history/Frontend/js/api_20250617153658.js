import { API_BASE_URL } from './apiConfig.js';

const API_BASE = "http://localhost:8080/api";

// Fetch all products
export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE}/products/all`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// Fetch one product by ID
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

// Submit order to backend
export async function submitOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  if (!res.ok) throw new Error("Failed to submit order");
  return res.json();
}
