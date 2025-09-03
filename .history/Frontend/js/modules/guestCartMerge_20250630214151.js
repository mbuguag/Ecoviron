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
