const API_BASE_URL = 'http://localhost:8080/api';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products/all`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
}

export async function fetchProductById(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) throw new Error('Product not found');
  return await response.json();
}
