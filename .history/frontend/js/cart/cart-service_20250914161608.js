
import { CartAPI } from "./api/cart-api.js";
import { getGuestCart, addToGuestCart, clearGuestCart } from "../guestCart.js";

function isLoggedIn() {
  return !!localStorage.getItem("jwtToken");
}

export async function getCartItems() {
  if (isLoggedIn()) {
    const cart = await CartAPI.getCart();
    return cart.items || [];
  } else {
    return getGuestCart();
  }
}

export async function addItemToCart(product, quantity = 1) {
  if (isLoggedIn()) {
    return CartAPI.addItem(product.id, quantity);
  } else {
    return addToGuestCart(product, quantity);
  }
}

export async function clearCart() {
  if (isLoggedIn()) {
    return CartAPI.clearCart();
  } else {
    return clearGuestCart();
  }
}
