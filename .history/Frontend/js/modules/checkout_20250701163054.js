import { productData } from "./productData.js";

const API_BASE_URL = "http://localhost:8080/api";

function getCartItems() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function calculateOrderSummary() {
  const cart = getCartItems();
  let total = 0;
  const items = cart.map(item => {
    const product = productData[item.id];
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    return {
      productId: item.id,
      quantity: item.quantity,
      price: product.price
    };
  });
  return { items, total };
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById("checkout-summary");
  const { items, total } = calculateOrderSummary();

  if (items.length === 0) {
    summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let html = `<ul class="checkout-list">`;
  items.forEach(item => {
    const product = productData[item.productId];
    html += `
      <li>
        ${product.name} - ${item.quantity} x KES ${item.price} = KES ${item.quantity * item.price}
      </li>
    `;
  });
  html += `</ul><p><strong>Total: KES ${total.toLocaleString()}</strong></p>`;

  summaryContainer.innerHTML = html;
}

function submitOrder() {
  const { items, total } = calculateOrderSummary();
  if (items.length === 0) {
    alert("Cannot place an order. Cart is empty.");
    return;
  }

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Please log in to place your order.");
    window.location.href = "login.html";
    return;
  }

  const orderPayload = {
    items, // e.g., [{ productId: '123', quantity: 2, price: 500 }]
    totalAmount: total
  };

  fetch(`${API_BASE_URL}/orders/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(orderPayload)
  })
    .then(res => {
      if (!res.ok) throw new Error("Order failed. Try again.");
      return res.text();
    })
    .then(message => {
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "order-success.html"; // optional success page
    })
    .catch(err => alert(err.message));
}

// Event listeners
window.addEventListener("DOMContentLoaded", renderCheckoutSummary);
document.getElementById("place-order-btn").addEventListener("click", submitOrder);
