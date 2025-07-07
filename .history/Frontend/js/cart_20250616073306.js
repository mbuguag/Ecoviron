class CartAPI {
    static BASE_URL = '/api/cart';

    // Get current user's cart
    static async getCart() {
        const response = await fetch(this.BASE_URL, {
            credentials: 'include'
        });
        return await response.json();
    }

    // Add item to cart
    static async addItem(productId, quantity = 1) {
        const response = await fetch(`${this.BASE_URL}/add?productId=${productId}&quantity=${quantity}`, {
            method: 'POST',
            credentials: 'include'
        });
        return await response.json();
    }

    // Update item quantity
    static async updateQuantity(itemId, quantity) {
        const response = await fetch(`${this.BASE_URL}/update?itemId=${itemId}&quantity=${quantity}`, {
            method: 'PUT',
            credentials: 'include'
        });
        return await response.json();
    }

    // Remove item from cart
    static async removeItem(itemId) {
        const response = await fetch(`${this.BASE_URL}/remove/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }

    // Clear entire cart
    static async clearCart() {
        const response = await fetch(`${this.BASE_URL}/clear`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }
}

class CartManager {
    static async init() {
        this.cart = await CartAPI.getCart();
        this.renderCart();
        this.setupEventListeners();
    }

    static async renderCart() {
        const container = document.getElementById('cart-container');
        
        if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <a href="../ecommerce/product-grid.html" class="btn primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        let html = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;

        let grandTotal = 0;

        this.cart.items.forEach(item => {
            const itemTotal = item.product.price * item.quantity;
            grandTotal += itemTotal;

            html += `
                <tr data-item-id="${item.id}">
                    <td class="product-cell">
                        <img src="${item.product.imageUrl || '../assets/images/placeholder.jpg'}" 
                             alt="${item.product.name}" 
                             class="cart-img">
                        <span>${item.product.name}</span>
                    </td>
                    <td>${this.formatPrice(item.product.price)}</td>
                    <td>
                        <input type="number" 
                               min="1" 
                               value="${item.quantity}"
                               class="quantity-input">
                    </td>
                    <td>${this.formatPrice(itemTotal)}</td>
                    <td>
                        <button class="btn danger small remove-btn">Remove</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="cart-summary">
                <p class="total-amount">Grand Total: ${this.formatPrice(grandTotal)}</p>
                <div class="cart-actions">
                    <a href="../ecommerce/product-grid.html" class="btn secondary">Continue Shopping</a>
                    <button id="clear-cart-btn" class="btn danger">Clear Cart</button>
                    <a href="checkout.html" class="btn primary">Proceed to Checkout</a>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    static formatPrice(amount) {
        return `KES ${amount.toLocaleString()}`;
    }

    static setupEventListeners() {
        // Quantity changes
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const itemId = e.target.closest('tr').dataset.itemId;
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity < 1) {
                    e.target.value = 1;
                    return;
                }
                
                try {
                    await CartAPI.updateQuantity(itemId, newQuantity);
                    this.cart = await CartAPI.getCart();
                    this.renderCart();
                } catch (error) {
                    console.error('Failed to update quantity:', error);
                    alert('Failed to update quantity. Please try again.');
                }
            }
        });

        // Remove buttons
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const itemId = e.target.closest('tr').dataset.itemId;
                try {
                    await CartAPI.removeItem(itemId);
                    this.cart = await CartAPI.getCart();
                    this.renderCart();
                } catch (error) {
                    console.error('Failed to remove item:', error);
                    alert('Failed to remove item. Please try again.');
                }
            }
            
            // Clear cart button
            if (e.target.id === 'clear-cart-btn') {
                if (confirm('Are you sure you want to clear your cart?')) {
                    try {
                        await CartAPI.clearCart();
                        this.cart = { items: [] };
                        this.renderCart();
                    } catch (error) {
                        console.error('Failed to clear cart:', error);
                        alert('Failed to clear cart. Please try again.');
                    }
                }
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => CartManager.init());