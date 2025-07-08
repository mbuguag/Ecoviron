import { isLoggedIn } from "./auth.js";
import { CartAPI } from "./cart-api.js";
import { GuestCart } from "./guest-cart.js";

export const CartService = {
  async getCart() {
    return isLoggedIn() ? (await CartAPI.getCart()).items : GuestCart.get();
  },
  async add(product, quantity = 1) {
    return isLoggedIn()
      ? await CartAPI.addItem(product.id, quantity)
      : GuestCart.add(product, quantity);
  },
  async update(productId, quantity, itemId = null) {
    return isLoggedIn()
      ? await CartAPI.updateQuantity(itemId, quantity)
      : GuestCart.update(productId, quantity);
  },
  async remove(productId, itemId = null) {
    return isLoggedIn()
      ? await CartAPI.removeItem(itemId)
      : GuestCart.remove(productId);
  },
  async clear() {
    return isLoggedIn() ? await CartAPI.clearCart() : GuestCart.clear();
  },
};
