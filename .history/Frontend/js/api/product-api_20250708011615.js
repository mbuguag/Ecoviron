import { API_BASE_URL } from "../apiConfig.js";

export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch products: ${res.status} - ${errorText}`);
  }
  return res.json(); // should return an array of product objects
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error(`Product with ID ${id} not found`);
  }
  return res.json();
}
