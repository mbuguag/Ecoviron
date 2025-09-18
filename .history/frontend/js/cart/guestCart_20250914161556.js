// guestCart.js
const GUEST_CART_KEY = "guest_cart";

/**
 * Guest cart item shape:
 * { productId, quantity, variantId?, attrs?: { color, size }, addedAt: ISOString }
 */

export function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch (err) {
    console.warn("Invalid guest cart in localStorage, clearing", err);
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
}

export function setGuestCart(cart) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function addToGuestCart(product, quantity = 1, opts = {}) {
  const cart = getGuestCart();
  const productId = product.productId || product.id;
  const variantId = opts.variantId || product.variantId || null;

  // Try to match both productId and variantId (if present)
  const idx = cart.findIndex(
    (i) => i.productId === productId && (i.variantId || null) === variantId
  );

  if (idx > -1) {
    cart[idx].quantity = Math.min((cart[idx].quantity || 0) + quantity, 999);
    cart[idx].updatedAt = new Date().toISOString();
  } else {
    cart.push({
      productId,
      quantity,
      variantId,
      attrs: opts.attrs || null,
      addedAt: new Date().toISOString(),
    });
  }

  setGuestCart(cart);
  return cart;
}
