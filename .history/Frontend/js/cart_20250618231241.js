import { CartAPI } from './cart-api.js';
import { getGuestCart, removeFromGuestCart } from './modules/guest-cart.js';
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



async function fetchProductDetails(productId) {
  const res = await fetch(`http://localhost:8080/api/products/${productId}`);
  if (!res.ok) throw new Error(`Product ${productId} not found`);
  return await res.json();
}

export async function renderCart() {
  const container = document.getElementById('cart-container');
  container.innerHTML = '<p>Loading cart...</p>';

  let cartItems = [];

  try {
    if (isLoggedIn()) {
      const cart = await CartAPI.getCart();
      cartItems = cart.items || [];
    } else {
      cartItems = getGuestCart();
    }

    if (cartItems.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }

    const enrichedItems = await Promise.all(
      cartItems.map(async item => {
        const product = await fetchProductDetails(item.productId);
        return {
          ...item,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || '', // optional
        };
      })
    );

    container.innerHTML = enrichedItems.map(item => `
      <div class="cart-item">
        <img src="${item.imageUrl}" alt="${item.name}" class="cart-thumb" />
        <div class="cart-details">
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)} x ${item.quantity}</p>
          <p><strong>Total:</strong> ${formatPrice(item.price * item.quantity)}</p>
          <button class="remove-item" data-id="${item.productId}">Remove</button>
        </div>
      </div>
    `).join('');

    setupRemoveListeners();

  } catch (error) {
    container.innerHTML = '<p>Failed to load cart. Try again later.</p>';
    console.error('Cart error:', error);
  }
}

function setupRemoveListeners() {
  const buttons = document.querySelectorAll('.remove-item');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id, 10);
      if (isLoggedIn()) {
        await CartAPI.removeItem(id);
      } else {
        removeFromGuestCart(id);
      }
      renderCart();
    });
  });
}