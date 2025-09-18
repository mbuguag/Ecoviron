// cart-actions.js
import { CartAPI } from "./cart/cart-api.js";
import { getGuestCart, addToGuestCart } from "./cart/guestCart.js";
import { mergeGuestCartToBackend } from "./modules/guestCartMerge.js";
import { isLoggedIn } from "./auth.js"; // re-enable when auth is ready

/* -----------------------------
   Add Item to Cart
--------------------------------*/
export async function addToCart(product, quantity = 1, opts = {}) {
  const badge = document.getElementById("mini-cart-count");
  const prevCount = badge ? parseInt(badge.textContent || "0", 10) : null;

  // Optimistic UI: bump cart count immediately
  if (badge) badge.textContent = (prevCount || 0) + quantity;

  try {
    if (isLoggedIn?.()) {
      await CartAPI.addItem(product.id, quantity, {
        variantId: opts.variantId,
        attrs: opts.attrs,
      });
    } else {
      addToGuestCart(product, quantity, opts);
    }

    showToast(`${product.name || "Item"} added to cart`);
    return true;
  } catch (err) {
    // Revert optimistic UI if server call failed
    if (badge && prevCount !== null) badge.textContent = prevCount;
    console.error("❌ Add to cart failed:", err);
    showToast("Failed to add item", { type: "error" });
    return false;
  }
}

/* -----------------------------
   Update Mini-Cart Count
--------------------------------*/
export async function updateMiniCartCount() {
  const badge = document.getElementById("mini-cart-count");
  if (!badge) return;

  try {
    let total = 0;

    if (isLoggedIn?.()) {
      const cart = await CartAPI.getCart();
      total = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
    } else {
      const guest = getGuestCart();
      total = guest.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }

    badge.textContent = total;
  } catch (err) {
    console.warn("⚠️ Failed to update mini-cart count:", err);
  }
}

/* -----------------------------
   Toast Helper
--------------------------------*/
function showToast(message, { type = "success", duration = 2500 } = {}) {
  try {
    const root = document.getElementById("toast-root") || document.body;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;

    Object.assign(el.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: 9999,
      padding: "10px 14px",
      borderRadius: "6px",
      color: type === "error" ? "#fff" : "#000",
      background: type === "error" ? "#e74c3c" : "#2ecc71",
      boxShadow: "0 6px 18px rgba(0,0,0,.12)",
      fontSize: "14px",
      fontWeight: "500",
    });

    root.appendChild(el);
    setTimeout(() => el.remove(), duration);
  } catch (e) {
    // Fail silently if toast cannot render
  }
}
