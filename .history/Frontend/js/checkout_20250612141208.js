// js/checkout.js
import { getCartItems, clearCart } from "./products.js";
import { apiPost } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  renderCartSummary();

  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const orderRequest = {
      fullName: formData.get("fullName"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      items: getCartItems()
    };

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("User not logged in");

      await apiPost("/api/orders", orderRequest, token);
      alert("Order placed successfully!");
      clearCart();
      window.location.href = "../index.html";
    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
  });
});

function renderCartSummary() {
  const cart = getCartItems();
  const container = document.getElementById("cart-summary");

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  let html = "<h3>Order Summary</h3><ul class='cart-summary'>";

  cart.forEach(item => {
    const product = getProductDetails(item.id);
    const itemTotal = item.quantity * product.price;
    total += itemTotal;
    html += `<li>${product.name} x ${item.quantity} = KES ${itemTotal}</li>`;
  });

  html += `</ul><p class="total-amount">Total: KES ${total}</p>`;
  container.innerHTML = html;
}

// Sample product lookup (same structure as your cart.js)
function getProductDetails(id) {
  const products = {
    1: { name: "Reusable Water Bottle", price: 850 },
    2: { name: "Solar Lantern", price: 2500 },
    3: { name: "Eco Tote Bag", price: 500 },
    4: { name: "Biodegradable Soap", price: 300 }
  };
  return products[id];
}
