// guest-cart.js

const CART_KEY = 'guestCart';

export function getGuestCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveGuestCart(cartItems) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

export function addToGuestCart(productId, quantity = 1) {
  const cart = getGuestCart();
  const index = cart.findIndex(item => item.productId === productId);

  if (index > -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  saveGuestCart(cart);
}

export function removeFromGuestCart(productId) {
  const cart = getGuestCart().filter(item => item.productId !== productId);
  saveGuestCart(cart);
}

export function clearGuestCart() {
  localStorage.removeItem(CART_KEY);
}
