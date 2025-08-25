import { CartAPI } from "./cart/cart-api.js";
import { getGuestCart, addToGuestCart } from "./cart/guestCart.js";
import { isLoggedIn } from "./auth.js";
import { BASE_PATH } from "../apiConfig.js";

/**
 * Add product to cart (guest or logged-in user)
 */
export async function addToCart(product, quantity = 1) {
  try {
    if (isLoggedIn()) {
      await CartAPI.addItem(product.id, quantity);
    } else {
      addToGuestCart(product, quantity);
    }

    await updateMiniCartCount();
    showToast(`${product.name} added to cart!`);
  } catch (err) {
    console.error("Add to cart failed", err);
    showToast("Failed to add item. Try again.", true);
  }
}

/**
 * Update mini-cart badge count
 */
export async function updateMiniCartCount() {
  const badge = document.getElementById("mini-cart-count");
  if (!badge) return;

  try {
    let totalItems = 0;
    if (isLoggedIn()) {
      const cart = await CartAPI.getCart();
      totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      const guestCart = getGuestCart();
      totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    }
    badge.textContent = totalItems;
  } catch (err) {
    console.warn("Failed to update mini cart count:", err);
  }
}

/**
 * Merge guest cart to backend after login
 */
export async function mergeGuestCartToBackend() {
  if (!isLoggedIn()) return;

  const guestCart = getGuestCart();
  if (!guestCart.length) return;

  for (const item of guestCart) {
    try {
      await CartAPI.addItem(item.productId || item.id, item.quantity);
    } catch (err) {
      console.warn("Failed to sync guest cart item:", item, err);
    }
  }

  localStorage.removeItem("guest_cart");
  await updateMiniCartCount();
}

/**
 * Setup add-to-cart button interactions
 */
export async function setupCartInteractions() {
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = parseInt(button.dataset.productId, 10);
      const name = button.dataset.productName;
      const price = parseFloat(button.dataset.productPrice);
      const quantity = parseInt(button.dataset.quantity || "1", 10);

      if (!id || !name || isNaN(price)) {
        console.warn("Invalid product data on button:", { id, name, price });
        showToast("Failed to add product to cart. Invalid data.", true);
        return;
      }

      const product = { id, name, price };
      await addToCart(product, quantity);
    });
  });
}

/**
 * Require authentication for checkout
 */
export function requireAuthForCheckout() {
  if (!isLoggedIn()) {
    sessionStorage.setItem(
      "redirectAfterLogin",
      `${BASE_PATH}ecommerce/checkout.html`
    );
    window.location.href = `${BASE_PATH}auth/login.html`;
  }
}

/**
 * Toast notification system
 */
function showToast(message, isError = false, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast-message ${isError ? "toast-error" : ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

// Minimal CSS for toast
const style = document.createElement("style");
style.textContent = `
.toast-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  z-index: 9999;
  opacity: 0.95;
  font-weight: 500;
}
.toast-message.toast-error {
  background: #f44336;
}
`;
document.head.appendChild(style);
