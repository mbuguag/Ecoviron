import { GuestCart } from "./guest-cart.js";
import { CartAPI } from "./cart-api.js";

export async function mergeGuestCartWithServer() {
  const guestCart = getGuestCart();
  if (!guestCart.length) return;

  try {
    const products = await fetchAllProducts();
    const validProductIds = products.map((p) => p.id);

    for (const item of guestCart) {
      const productId = item.productId || item.id; // handles either key
      if (!validProductIds.includes(productId)) {
        console.warn("Skipping invalid product ID:", productId);
        continue;
      }

      await CartAPI.addItem(productId, item.quantity);
    }

    clearGuestCart();
    console.log("✅ Guest cart merged and cleared");
  } catch (error) {
    console.error("❌ Failed to merge guest cart:", error);
  }
}
