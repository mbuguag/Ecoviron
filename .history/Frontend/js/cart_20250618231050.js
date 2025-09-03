import { CartAPI } from './cart-api.js';
import { getGuestCart, remove } from './modules/guest-cart.js';
import { loadLayoutComponents } from './domUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadLayoutComponents(); // optional, for header/footer
  await renderCart();
});
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
      await addToCart(productId, quantity);
    });
  });
}


export async function renderCart() {
  const container = document.getElementById('cart-container');
  container.innerHTML = '<p>Loading cart...</p>';

  let cartItems = [];

  try {
    if (isLoggedIn()) {
      const cart = await CartAPI.getCart();
      cartItems = cart.items || []; // assuming cart has an 'items' list
    } else {
      cartItems = getGuestCart(); // from localStorage
    }

    if (cartItems.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }

    container.innerHTML = cartItems.map(item => `
      <div class="cart-item">
        <span><strong>Product ID:</strong> ${item.productId}</span>
        <span><strong>Quantity:</strong> ${item.quantity}</span>
      </div>
    `).join('');

  } catch (error) {
    container.innerHTML = '<p>Failed to load cart. Please try again later.</p>';
    console.error('Cart loading failed:', error);
  }
}