import { CartAPI } from './cart-api.js';

export async function setupCartInteractions() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.productId;
            try {
                await CartAPI.addItem(productId);
                alert("Added to cart!");
            } catch (err) {
                console.error('Add to cart failed', err);
                alert("Failed to add item. Try again.");
            }
        });
    });
}
