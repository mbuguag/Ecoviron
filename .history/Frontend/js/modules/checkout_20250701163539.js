import { productData } from "./productData.js";

const API_BASE_URL = "http://localhost:8080/api";

// DOM Elements
const paymentSelect = document.getElementById("payment");
const mpesaPayment = document.getElementById("mpesa-payment");
const cardPayment = document.getElementById("card-payment");
const payBtn = document.getElementById("pay-btn");
const placeOrderBtn = document.getElementById("place-order-btn");
const statusMessage = document.getElementById("status");
const phoneInput = document.getElementById("phone");
const refSpan = document.getElementById("ref");

function getCartItems() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function calculateOrderSummary() {
  const cart = getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const product = productData[item.id];
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    return {
      productId: item.id,
      quantity: item.quantity,
      price: product.price,
    };
  });
  return { items, total };
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById("checkout-summary");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const { items, total } = calculateOrderSummary();

  if (items.length === 0) {
    summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
    placeOrderBtn.disabled = true;
    return;
  }

  let html = `<ul class="checkout-list">`;
  items.forEach((item) => {
    const product = productData[item.productId];
    html += `
      <li>
        ${product.name} - ${item.quantity} x KES ${item.price} = KES ${
      item.quantity * item.price
    }
      </li>
    `;
  });
  html += `</ul>`;

  summaryContainer.innerHTML = html;
  subtotalEl.textContent = `KES ${total.toLocaleString()}`;
  totalEl.textContent = `KES ${(total + 200).toLocaleString()}`; // Adding shipping

  // Generate random order reference
  refSpan.textContent = `#${Math.floor(100000 + Math.random() * 900000)}`;
}

async function submitOrder() {
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

  // Get form data
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const paymentMethod = document.getElementById("payment").value;

  if (!name || !email || !address || !paymentMethod) {
    alert("Please fill in all required fields.");
    return;
  }

  if (paymentMethod === "mpesa" && !phoneInput.value) {
    alert("Please enter your M-Pesa number.");
    return;
  }

  const orderPayload = {
    items,
    totalAmount: total,
    shippingAddress: address,
    paymentMethod,
    customerDetails: { name, email },
  };

  if (paymentMethod === "mpesa") {
    orderPayload.mpesaNumber = phoneInput.value;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const order = await response.json();
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    window.location.href = `order-success.html?orderId=${order.id}`;
  } catch (error) {
    console.error("Order error:", error);
    alert(`Order failed: ${error.message}`);
  }
}

function handlePaymentMethodChange() {
  mpesaPayment.classList.remove("active");
  cardPayment.classList.remove("active");

  if (this.value === "mpesa") {
    mpesaPayment.classList.add("active");
  } else if (this.value === "card") {
    cardPayment.classList.add("active");
  }
}

function handleMpesaPayment() {
  const phone = phoneInput.value;
  if (!phone.match(/^07[0-9]{8}$/)) {
    statusMessage.textContent = "Please enter a valid M-Pesa number";
    statusMessage.style.color = "red";
    return;
  }

  statusMessage.textContent = "Sending payment request...";
  statusMessage.style.color = "blue";

  // Simulate payment processing
  setTimeout(() => {
    statusMessage.textContent =
      "Payment successful! Complete your order below.";
    statusMessage.style.color = "green";
    placeOrderBtn.disabled = false;
  }, 2000);
}

// Initialize
function init() {
  renderCheckoutSummary();

  // Event listeners
  paymentSelect.addEventListener("change", handlePaymentMethodChange);
  payBtn.addEventListener("click", handleMpesaPayment);
  placeOrderBtn.addEventListener("click", submitOrder);
}

document.addEventListener("DOMContentLoaded", init);
