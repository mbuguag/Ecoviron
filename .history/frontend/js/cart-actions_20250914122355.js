// cart-actions.js (update your existing module)
import { CartAPI } from "./cart/cart-api.js";
import { getGuestCart, addToGuestCart } from "./cart/guestCart.js";
import { mergeGuestCartToBackend } from "./modules/guestCartMerge.js";
import { isLoggedIn } from "./auth.js";

export async function addToCart(product, quantity = 1, opts = {}) {
  // Optimistic UI: increment mini cart first
  const badge = document.getElementById("mini-cart-count");
  const prevCount = badge ? parseInt(badge.textContent || "0", 10) : null;
  if (badge) badge.textContent = (prevCount || 0) + quantity;

  try {
    if (isLoggedIn()) {
      // try server add, if fails revert badge
      await CartAPI.addItem(product.id, quantity, { variantId: opts.variantId, attrs: opts.attrs });
    } else {
      addToGuestCart(product, quantity, opts);
    }

    // success feedback
    showToast("Added to cart");
    return true;
  } catch (err) {
    // revert mini-cart count if we bumped it
    if (badge && prevCount !== null) badge.textContent = prevCount;
    console.error("Add to cart failed", err);
    showToast("Failed to add item", { type: "error" });
    return false;
  }
}

export async function updateMiniCartCount() {
  const badge = document.getElementById("mini-cart-count");
  if (!badge) return;

  try {
    let total = 0;
    if (isLoggedIn()) {
      const cart = await CartAPI.getCart();
      total = (cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
    } else {
      const guest = getGuestCart();
      total = guest.reduce((s, i) => s + (i.quantity || 0), 0);
    }
    badge.textContent = total;
  } catch (err) {
    console.warn("Failed to update mini cart count:", err);
  }
}

// tiny toast helper; attach to your UI system if you already have one
function showToast(message, { type = "success", duration = 2500 } = {}) {
  try {
    const root = document.getElementById("toast-root") || document.body;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    Object.assign(el.style, {
      position: "fixed", right: "20px", bottom: "20px", zIndex: 9999, padding: "10px 14px", borderRadius: "6px", boxShadow: "0 6px 18px rgba(0,0,0,.12)"
    });
    root.appendChild(el);
    setTimeout(() => el.remove(), duration);
  } catch (e) { /* swallow toast errors */ }
}
