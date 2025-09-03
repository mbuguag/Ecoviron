import { getGuestCart, clearGuestCart } from "./guest-cart.js";
import {

export async function mergeGuestCartWithServer() {
  const guestCart = getGuestCart();
  if (!guestCart.length) return;

  try {
    const validProductIds = await CartAPI.getAllProductIds();

    for (const item of guestCart) {
      const productId = item.productId || item.id;
      if (!validProductIds.includes(productId)) {
        console.warn("Skipping invalid product ID:", productId);
        continue;
      }

      await CartAPI.addItem(productId, item.quantity);
    }

    clearGuestCart();
    console.log(" Guest cart merged and cleared.");
  } catch (error) {
    console.error(" Failed to merge guest cart:", error);
  }
}
