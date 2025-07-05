import { layoutLoaded } from "./main.js";

const API_BASE_URL = "http://localhost:8080/api";
const container = document.getElementById("order-details");

function getOrderRefFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString(); // Or toLocaleDateString() for short
}

function renderOrderDetails(order) {
  const {
    orderReference,
    orderDate,
    customerName,
    shippingAddress,
    status,
    totalAmount,
    items,
  } = order;

  let html = `
    <h2>Order Confirmation</h2>
    <div class="order-meta">
      <p><strong>Reference:</strong> ${orderReference}</p>
      <p><strong>Date:</strong> ${formatDateTime(orderDate)}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
    </div>

    <h3>Items</h3>
    <ul class="order-items">`;

  items.forEach((item) => {
    const { productName, quantity, price } = item;
    const subtotal = quantity * price;

    html += `
      <li class="order-item">
        <span>${quantity} x ${productName}</span>
        <span>${formatCurrency(subtotal)}</span>
      </li>`;
  });

  html += `</ul>
    <div class="order-total">
      <strong>Total Paid:</strong> ${formatCurrency(totalAmount)}
    </div>`;

  container.innerHTML = html;
}

async function fetchOrderDetails(ref) {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      container.innerHTML = `<p>You must be logged in to view this order.</p>`;
      return;
    }

    const res = await fetch(`${API_BASE_URL}/orders/${ref}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Order not found.");
    }

    const order = await res.json();
    renderOrderDetails(order);
  } catch (err) {
    container.innerHTML = `<p class="error">${err.message}</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  const orderRef = getOrderRefFromURL();
  if (!orderRef) {
    container.innerHTML = `<p>No order reference found in URL.</p>`;
    return;
  }

  fetchOrderDetails(orderRef);
});
