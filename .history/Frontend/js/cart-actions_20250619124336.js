import { CartAPI } from './cart-api.js';
import { addToGuestCart } from './modules/guest-cart.js';

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
      const product = {
        id: parseInt(button.dataset.productId),
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
      };
      const quantity = parseInt(button.dataset.quantity || "1", 10);
      await addToCart(product, quantity);
    });
  });
}


function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    return token && token.length > 0;
}
