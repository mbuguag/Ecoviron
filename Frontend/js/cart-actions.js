import { CartAPI } from './cart-api.js';
import { getGuestCart, addToGuestCart } from './modules/guest-cart.js';
import { isLoggedIn } from './auth.js';


export async function addToCart(product, quantity = 1) {
  try {
    if (isLoggedIn()) {
      await CartAPI.addItem(product.id, quantity);
    } else {
      addToGuestCart(product, quantity);
    }

    await updateMiniCartCount();
    alert("Added to cart!");
  } catch (err) {
    console.error("Add to cart failed", err);
    alert("Failed to add item. Try again.");
  }
}

export async function updateMiniCartCount() {
  const badge = document.getElementById("mini-cart-count");
  if (!badge) return;

  try {
    let totalItems = 0;

    if (isLoggedIn()) {
      const cart = await CartAPI.getCart();
      totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      const guestCart = getGuestCart();
      totalItems = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    }

    badge.textContent = totalItems;
  } catch (err) {
    console.warn("Failed to update mini cart count:", err);
  }
}




export async function setupCartInteractions() {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = parseInt(button.dataset.productId, 10);
      const name = button.dataset.productName;
      const price = parseFloat(button.dataset.productPrice);
      const quantity = parseInt(button.dataset.quantity || "1", 10);

      if (!id || !name || isNaN(price)) {
        console.warn("Invalid product data on button:", {
          id,
          name,
          price,
        });
        alert("Failed to add product to cart. Invalid product data.");
        return;
      }

      const product = { id, name, price };
      await addToCart(product, quantity);
    });
  });
}

