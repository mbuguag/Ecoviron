export class CartAPI {
    static BASE_URL = 'http://localhost:8080/api/cart';

    static async getCart() {
        const response = await fetch(this.BASE_URL,{
            headers: getAuthHeaders()
    });
        return await response.json();
    }

     static async addItem(productId, quantity = 1) {
        const response = await fetch(`${this.BASE_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ productId, quantity })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Add failed: ${response.status} - ${text}`);
        }

        return await response.json();
    }

    export const CartAPI = {
  async updateQuantity(itemId, quantity) {
    const token = localStorage.getItem("jwtToken");

    const response = await fetch(
      `${API_BASE_URL}/cart/update?itemId=${itemId}&quantity=${quantity}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }

    return await response.json(); // This line will throw if the response is empty
  },
};


    static async removeItem(itemId) {
        const response = await fetch(`${this.BASE_URL}/remove/${itemId}`, {
            method: 'DELETE'
        });
        return response.ok;
    }

    static async clearCart() {
        const response = await fetch(`${this.BASE_URL}/clear`, {
            method: 'DELETE'
        });
        return response.ok;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}