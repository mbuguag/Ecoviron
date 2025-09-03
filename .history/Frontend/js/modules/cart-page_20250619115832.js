import { CartAPI } from './cart-api.js';
import { getGuestCart } from './modules/guest-cart.js';

document.addEventListener("DOMContentLoaded", async () => {
    await loadCartItems();
});

async function loadCartItems() {
    let items = [];

    if (isLoggedIn()) {
        try {
            const cart = await CartAPI.getCart();
            items = cart.items || [];
        } catch (e) {
            console.error("Failed to fetch authenticated cart", e);
        }
    } else {
        items = getGuestCart();
    }

    renderCart(items);
}

function renderCart(items) {
    const container = document.getElementById("cart-container");
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="cart-item">
            <p>Product ID: ${item.productId || item.product?.id}</p>
            <p>Quantity: ${item.quantity}</p>
        </div>
    `).join("");
}

function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    return token && token.length > 0;
}
