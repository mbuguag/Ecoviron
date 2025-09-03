export class CartAPI {
  static BASE_URL = "http://localhost:8080/api/cart";
  static PRODUCTS_URL = "http://localhost:8080/api/products";

  static async getCart() {
    const response = await fetch(this.BASE_URL, {
      headers: getAuthHeaders(),
    });
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

// ✅ guest-cart.js
export const GuestCart = {
  get() {
    const data = localStorage.getItem("guest_cart");
    return data ? JSON.parse(data) : [];
  },
  add(product, quantity = 1) {
    const cart = this.get();
    const existing = cart.find(
      (i) => i.productId === product.id || i.id === product.id
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  },
  update(productId, quantity) {
    const cart = this.get();
    const item = cart.find(
      (i) => i.productId === productId || i.id === productId
    );
    if (item) {
      item.quantity = quantity;
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
  },
  remove(productId) {
    const cart = this.get().filter(
      (i) => i.productId !== productId && i.id !== productId
    );
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  },
  clear() {
    localStorage.removeItem("guest_cart");
  },
};
