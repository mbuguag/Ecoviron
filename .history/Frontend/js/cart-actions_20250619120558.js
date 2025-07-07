import { CartAPI } from './cart-api.js';
import { addToGuestCart } from './modules/guest-cart.js';

export async function addToCart(productId, quantity = 1) {
    try {
        if (isLoggedIn()) {
            await CartAPI.addItem(productId, quantity);
        } else {
            addToGuestCart(productId, quantity);
        }
        alert("Added to cart!");
    } catch (err) {
        console.error('Add to cart failed', err);
        alert("Failed to add item. Try again.");
    }
}

export async function setupCartInteractions() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.productId;
            const quantity = parseInt(button.dataset.quantity || "1", 10);
            await addToCart(productId, quantity);
        });
    });
}

function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    return token && token.length > 0;
}
