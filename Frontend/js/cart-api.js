export class CartAPI {
    static BASE_URL = '/api/cart';

    static async getCart() {
        const response = await fetch(this.BASE_URL, { credentials: 'include' });
        return await response.json();
    }

    static async addItem(productId, quantity = 1) {
        const response = await fetch(`${this.BASE_URL}/add?productId=${productId}&quantity=${quantity}`, {
            method: 'POST',
            credentials: 'include'
        });
        return await response.json();
    }

    static async updateQuantity(itemId, quantity) {
        const response = await fetch(`${this.BASE_URL}/update?itemId=${itemId}&quantity=${quantity}`, {
            method: 'PUT',
            credentials: 'include'
        });
        return await response.json();
    }

    static async removeItem(itemId) {
        const response = await fetch(`${this.BASE_URL}/remove/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }

    static async clearCart() {
        const response = await fetch(`${this.BASE_URL}/clear`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }
}
