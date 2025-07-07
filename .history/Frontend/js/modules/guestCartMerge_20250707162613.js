import { getGuestCart, clearGuestCart } from "./guestCart.js";
import { CartAPI } from "./CartAPI.js";

export async function mergeGuestCartWithServer() {
  const guestCart = getGuestCart();
 
  const validProducts = await CartAPI.getAllProductIds(); // Assume this exists

  for (const item of guestCart) {
    if (!validProducts.includes(item.productId)) {
      console.warn("Skipping invalid product ID:", item.productId);
      continue;
    }
    await CartAPI.addItem(item.productId, item.quantity);
  }

  if (!guestCart.length) return;

  try {
    for (const item of guestCart) {
      await CartAPI.addItem(item.productId, item.quantity);
    }
    clearGuestCart();
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
  }
}
