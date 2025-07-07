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

async function renderCart() {
    const container = document.getElementById("cart-container");
    let cartItems = [];
    const token = localStorage.getItem("jwt");

    try {
        if (token) {
            const userCart = await CartAPI.getCart();
            cartItems = userCart.items || [];
        } else {
            cartItems = getGuestCart();
        }

        if (cartItems.length === 0) {
            container.innerHTML = `<p>Your cart is empty.</p>`;
            return;
        }

        container.innerHTML = `
            <ul class="cart-items">
                ${cartItems.map(item => `
                    <li class="cart-item">
                        <span>${item.product?.name || item.name}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>KES ${(item.product?.price || item.price).toLocaleString()}</span>
                    </li>
                `).join("")}
            </ul>
        `;
    } catch (error) {
        container.innerHTML = `<p>Failed to load cart. Please try again later.</p>`;
        console.error("Cart load error:", error);
    }
}

function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    return token && token.length > 0;
}
