import { CartService } from "./cart-service.js";

export async function updateMiniCartCount() {
  const badge = document.getElementById("mini-cart-count");
  if (!badge) return;

  const cartItems = await CartService.getCart();
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = total;
}
