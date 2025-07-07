import { productData } from "./productData.js";

const API_BASE_URL = "http://localhost:8080/api";

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
  const { items, total } = calculateOrderSummary();

  if (items.length === 0) {
    summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
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
  html += `</ul><p><strong>Total: KES ${total.toLocaleString()}</strong></p>`;

  summaryContainer.innerHTML = html;
}

function handlePaymentMethodChange() {
  const paymentSelect = document.getElementById("payment");
  const mpesaSection = document.getElementById("mpesa-phone-section");

  paymentSelect.addEventListener("change", () => {
    mpesaSection.style.display =
      paymentSelect.value === "mpesa" ? "block" : "none";
  });
}

function submitOrder(event) {
  event.preventDefault();

  const { items, total } = calculateOrderSummary();
  if (items.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Please log in to place your order.");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const paymentMethod = document.getElementById("payment").value;
  const mpesaPhone = document.getElementById("mpesa-phone").value.trim();

  if (!name || !email || !address || !paymentMethod) {
    alert("Please fill in all required fields.");
    return;
  }

  if (paymentMethod === "mpesa" && !mpesaPhone) {
    alert("Please enter your M-Pesa phone number.");
    return;
  }

  const orderPayload = {
    items,
    totalAmount: total,
  };

  fetch(`${API_BASE_URL}/orders/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Order failed");
      return res.json(); // Expecting order object with orderReference
    })
    .then((order) => {
      if (paymentMethod === "mpesa") {
        initiateMpesaPayment(mpesaPhone, total, order.orderReference);
      } else {
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        window.location.href = "order-success.html";
      }
    })
    .catch((err) => alert("Error placing order: " + err.message));
}

function initiateMpesaPayment(phone, amount, orderReference) {
  fetch(`${API_BASE_URL}/payment/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      amount: String(amount),
      orderReference,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to initiate M-Pesa payment");
      return res.text();
    })
    .then(() => {
      alert("M-Pesa STK Push sent! Check your phone to complete payment.");
      localStorage.removeItem("cart");
      window.location.href = "order-success.html";
    })
    .catch((err) => {
      alert("M-Pesa payment failed: " + err.message);
    });
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  handlePaymentMethodChange();
});
document
  .getElementById("checkout-form")
  .addEventListener("submit", submitOrder);
