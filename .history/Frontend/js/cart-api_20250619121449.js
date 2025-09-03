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

    static async updateQuantity(itemId, quantity) {
        const response = await fetch(`${this.BASE_URL}/update?itemId=${itemId}&quantity=${quantity}`, {
            method: 'PUT'
        });
        return await response.json();
    }

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
    const token = localStorage.getItem("jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
}