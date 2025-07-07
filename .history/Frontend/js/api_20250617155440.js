import { API_BASE_URL } from './apiConfig.js';


// Fetch all products
export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// Fetch one product by ID
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

// Submit order to backend
export async function submitOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  if (!res.ok) throw new Error("Failed to submit order");
  return res.json();
}
