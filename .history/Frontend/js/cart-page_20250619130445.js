import { CartAPI } from './cart-api.js';
import { getGuestCart } from './modules/guest-cart.js';
import { fetchAllProducts, fetchProductById } from './api.js';

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
      const guestRawItems = getGuestCart();

      cartItems = await Promise.all(
        guestRawItems.map(async (item) => {
          try {
            const product = await fetchProductById(item.productId);
            return {
              product,
              quantity: item.quantity,
            };
          } catch (err) {
            console.warn("Product not found for guest cart", item.productId);
            return null;
          }
        })
      );
      cartItems = cartItems.filter(Boolean);
    }

    if (cartItems.length === 0) {
      container.innerHTML = `<p>Your cart is empty.</p>`;
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    container.innerHTML = `
      <ul class="cart-items">
        ${cartItems
          .map(
            (item) => `
            <li class="cart-item">
              <span>${item.product.name}</span>
              <span>Qty: ${item.quantity}</span>
              <span>KES ${(
                item.product.price * item.quantity
              ).toLocaleString()}</span>
            </li>
          `
          )
          .join("")}
      </ul>

      <div class="cart-summary">
        <strong>Total: KES ${total.toLocaleString()}</strong>
      </div>

      <div class="cart-actions">
        <a href="checkout.html" class="btn btn-primary proceed-checkout">Proceed to Checkout</a>
      </div>
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
