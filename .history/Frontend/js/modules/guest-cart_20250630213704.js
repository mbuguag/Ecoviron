import { getGuestCart, clearGuestCart } from "./guestCart.js";
import { CartAPI } from "./CartAPI.js";

export async function mergeGuestCartWithServer() {
  const guestCart = getGuestCart();
  if (!guestCart.length) return;

  try {
    for (const item of guestCart) {
      await CartAPI.addItem(item.id, item.quantity);
    }
    clearGuestCart();
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
  }
}

const GUEST_CART_KEY = "guest_cart";

export function getGuestCart() {
  const data = localStorage.getItem(GUEST_CART_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToGuestCart(product, quantity = 1) {
  const cart = getGuestCart();
  const index = cart.findIndex((item) => item.id === product.id);

  if (index > -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}
