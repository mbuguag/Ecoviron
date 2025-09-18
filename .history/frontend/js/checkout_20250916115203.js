// checkout.js
import { getCartItems, clearCart } from "./cart/cart-service.js";
import { isLoggedIn } from "./auth.js";
import { formatPrice, BASE_PATH } from "./apiConfig.js";

/**
 * Normalize a cart item from different sources
 * - Guest cart: { productId, name, price, quantity }
 * - Backend: { product: { id, name, price }, quantity }
 * - Backend alt: { id, name, price, quantity }
 */
function normalizeCartItem(item) {
  if (!item) return null;

  // Case: backend with nested product
  if (item.product) {
    return {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity || 1,
    };
  }

  // Case: guest cart (or merged object)
  if (item.productId && !item.name && !item.price) {
    console.warn("Guest cart item missing name/price:", item);
    return null;
  }

  return {
    id: item.productId || item.id,
    name: item.name || "Unnamed product",
    price: item.price ?? 0,
    quantity: item.quantity || 1,
  };
}

/**
 * Render checkout summary items into DOM
 */
function renderCheckoutItems(container, items) {
  container.innerHTML = ""; // Clear previous

  if (!items.length) {
    container.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <span class="checkout-name">${item.name}</span>
      <span class="checkout-qty">x${item.quantity}</span>
      <span class="checkout-price">${formatPrice(item.price * item.quantity)}</span>
    `;
    container.appendChild(row);
  });
}

/**
 * Load checkout summary
 */
export async function loadCheckoutSummary() {
  const container = document.getElementById("checkout-summary");
  const totalEl = document.getElementById("checkout-total");

  if (!container || !totalEl) {
    console.warn("Checkout summary elements not found.");
    return;
  }

  try {
    const rawItems = await getCartItems();
    const items = (rawItems || [])
      .map(normalizeCartItem)
      .filter((i) => i !== null);

    renderCheckoutItems(container, items);

    // Compute total
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalEl.textContent = formatPrice(total);
  } catch (err) {
    console.error("Failed to load checkout summary:", err);
    container.innerHTML = `<p class="error">Failed to load cart. Please try again.</p>`;
    totalEl.textContent = formatPrice(0);
  }
}

/**
 * Hook up checkout actions
 */
export function setupCheckout() {
  document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutSummary();

    // Example: attach place-order button
    const placeOrderBtn = document.getElementById("place-order-btn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", async () => {
        if (!isLoggedIn()) {
          alert("Please log in to place your order.");
          window.location.href = `${BASE_PATH}auth/login.html`;
          return;
        }

        try {
          // Clear cart after order placed (stub for real API)
          await clearCart();
          alert("Order placed successfully!");
          window.location.href = `${BASE_PATH}order-confirmation.html`;
        } catch (err) {
          console.error("Order placement failed:", err);
          alert("Failed to place order. Please try again.");
        }
      });
    }
  });
}

// Auto-init if directly included
setupCheckout();
