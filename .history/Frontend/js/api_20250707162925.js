import { API_BASE_URL } from './apiConfig.js';



export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}


export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}


export async function submitOrder(orderData) {
  const token = localStorage.getItem("jwtToken");

  const res = await fetch(`${API_BASE_URL}/orders/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include token if protected
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to submit order: ${error}`);
  }

  return res.json();
}


  if (!res.ok) throw new Error("Failed to submit order");
  return res.json();
}

