import { CartAPI } from './cart-api.js';
import { getGuestCart, addToGuestCart } from './modules/guest-cart.js';


export async function addToCart(product, quantity = 1) {
  try {
    if (isLoggedIn()) {
      await CartAPI.addItem(product.id, quantity);
    } else {
      addToGuestCart(product, quantity); // Pass full product object
    }
    alert("Added to cart!");
  } catch (err) {
    console.error("Add to cart failed", err);
    alert("Failed to add item. Try again.");
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



function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    return token && token.length > 0;
}
