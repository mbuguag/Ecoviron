import { GuestCart } from "./guest-cart.js";
import { CartAPI } from "./cart-api.js";

export async function mergeGuestCartWithServer() {
  const guestCart = GuestCart.get();
  if (!guestCart.length) return;

  const validProducts = await CartAPI.getAllProductIds();
  for (const item of guestCart) {
    if (validProducts.includes(item.productId)) {
      await CartAPI.addItem(item.productId, item.quantity);
    }
  }
  GuestCart.clear();
}
