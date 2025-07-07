const API_BASE_URL = 'http://localhost:8080/api';


  @returns {Promise<Array>} List of products
 
export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products/all`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
}

/**
 * Fetch a single product by ID.
 * @param {number|string} productId
 * @returns {Promise<Object>} Product details
 */
export async function fetchProductById(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) throw new Error('Product not found');
  return await response.json();
}
