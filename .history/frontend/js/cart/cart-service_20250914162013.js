// cart-service.js
import { CartAPI } from "./api/cart-api.js";
import { getGuestCart, addToGuestCart, clearGuestCart } from "../guestCart.js";


function isLoggedIn() {
  return !!localStorage.getItem("jwtToken");
}

export async function getCartItems() {
  return isLoggedIn() ? (await CartAPI.getCart()).items : getGuestCart();
}

export async function addItemToCart(product, quantity = 1) {
  return isLoggedIn()
    ? CartAPI.addItem(product.id, quantity)
    : addToGuestCart(product, quantity);
}

export async function updateCartQuantity(itemId, quantity) {
  if (isLoggedIn()) {
    return CartAPI.updateQuantity(itemId, quantity);
  } else {
    const cart = getGuestCart();
    const idx = cart.findIndex((i) => i.productId === itemId);
    if (idx > -1) {
      cart[idx].quantity = quantity;
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
    return cart;
  }
}

export async function clearCart() {
  return isLoggedIn() ? CartAPI.clearCart() : clearGuestCart();
}

