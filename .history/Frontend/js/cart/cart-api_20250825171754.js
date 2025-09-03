import { API_BASE_URL, BASE_PATH } from "../apiConfig.js";

/**
 * CartAPI: Handles all cart-related backend requests.
 * Automatically switches between dev/production based on API_BASE_URL.
 */
export class CartAPI {
  static BASE_URL = `${API_BASE_URL}/cart`;
  static PRODUCTS_URL = `${API_BASE_URL}/products`;

  /** Fetch the current user's cart */
  static async getCart() {
    try {
      const response = await fetch(this.BASE_URL, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("CartAPI.getCart error:", err);
      return { items: [] }; // fallback
    }
  }

  /** Add item to cart */
  static async addItem(productId, quantity = 1) {
    try {
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
    } catch (err) {
      console.error("CartAPI.addItem error:", err);
      throw err;
    }
  }

  /** Update quantity of a cart item */
  static async updateQuantity(itemId, quantity) {
    try {
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
    } catch (err) {
      console.error("CartAPI.updateQuantity error:", err);
      throw err;
    }
  }

  /** Remove item from cart */
  static async removeItem(itemId) {
    try {
      const response = await fetch(`${this.BASE_URL}/remove/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (err) {
      console.error("CartAPI.removeItem error:", err);
      return false;
    }
  }

  /** Clear entire cart */
  static async clearCart() {
    try {
      const response = await fetch(`${this.BASE_URL}/clear`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (err) {
      console.error("CartAPI.clearCart error:", err);
      return false;
    }
  }

  /** Get all valid product IDs */
  static async getAllProductIds() {
    try {
      const res = await fetch(this.PRODUCTS_URL);
      if (!res.ok) throw new Error("Failed to fetch products");
      const products = await res.json();
      return products.map((product) => product.id);
    } catch (err) {
      console.error("CartAPI.getAllProductIds error:", err);
      return [];
    }
  }
}

/** Get JWT headers if logged in */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
