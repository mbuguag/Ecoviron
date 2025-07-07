import { CartAPI } from './cart-api.js';
import { addToGuestCart } from './modules/guest-cart.js';

function isLoggedIn() {
  return !!localStorage.getItem('jwt');
}

export async function addToCart(productId, quantity = 1) {
  try {
    if (isLoggedIn()) {
      await CartAPI.addItem(productId, quantity);
      alert("Added to cart!");
    } else {
      addToGuestCart(parseInt(productId, 10), quantity);
      alert("Added to cart (guest)!");
    }
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
