import { CartAPI } from './cart-api.js';
import 

function isLoggedIn() {
  return !!localStorage.getItem('jwt');
}

export async function addToCart(productId, quantity = 1) {
    try {
        await CartAPI.addItem(productId, quantity);
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
            try {
                await CartAPI.addItem(productId, quantity);
                alert("Added to cart!");
            } catch (err) {
                console.error('Add to cart failed', err);
                alert("Failed to add item. Try again.");
            }
        });
    });
}
