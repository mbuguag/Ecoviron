import { API_BASE_URL } from "../apiConfig.js";

export class CartAPI {
  static BASE_URL = `${API_BASE_URL}/cart`;
  static PRODUCTS_URL = `${API_BASE_URL}/products`;

  static async getCart() {
    const response = await fetch(this.BASE_URL, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch cart");
    return await response.json();
  }

  static async addItem(productId, quantity = 1) {
    const response = await fetch(`${this.BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Add failed: ${response.status} - ${text}`);
    }

    return await response.json();
  }

  static async updateQuantity(itemId, quantity) {
    const response = await fetch(
      `${this.BASE_URL}/update?itemId=${itemId}&quantity=${quantity}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Update failed: ${response.status} - ${text}`);
    }

    return await response.json();
  }

  static async removeItem(itemId) {
    const response = await fetch(`${this.BASE_URL}/remove/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  }

  static async clearCart() {
    const response = await fetch(`${this.BASE_URL}/clear`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  }

  static async getAllProductIds() {
    const res = await fetch(this.PRODUCTS_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    const products = await res.json();
    return products.map((product) => product.id);
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
