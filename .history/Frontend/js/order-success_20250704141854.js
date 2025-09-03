import { layoutLoaded } from "./main.js";

const API_BASE_URL = "http://localhost:8080/api";
const orderDetailsContainer = document.getElementById("order-details");

function getOrderReferenceFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function renderOrderDetails(order) {
  const {
    orderReference,
    orderDate,
    status,
    shippingAddress,
    totalAmount,
    items,
    user,
  } = order;

  let html = `
    <div class="order-header">
      <p><strong>Order Reference:</strong> ${orderReference}</p>
      <p><strong>Date:</strong> ${formatDateTime(orderDate)}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Customer:</strong> ${user?.fullName || "N/A"}</p>
      <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
    </div>
    <hr>
    <h3>Items</h3>
    <ul class="order-items">`;

  for (const item of items) {
    const name = item.product?.name || "Product";
    const price = item.price || 0;
    const quantity = item.quantity;
    const subtotal = price * quantity;

    html += `
      <li class="order-item">
        <span>${quantity} x ${name}</span>
        <span>${formatCurrency(subtotal)}</span>
      </li>`;
  }

  html += `</ul>
    <div class="order-total mt-2">
      <strong>Total Paid:</strong> ${formatCurrency(totalAmount)}
    </div>`;

  orderDetailsContainer.innerHTML = html;
}

async function fetchOrderDetails(orderRef) {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      orderDetailsContainer.innerHTML = `<p>You must be logged in to view this order.</p>`;
      return;
    }

    const res = await fetch(`${API_BASE_URL}/orders/${orderRef}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Order not found or access denied.");
    }

    const order = await res.json();
    renderOrderDetails(order);
  } catch (err) {
    orderDetailsContainer.innerHTML = `<p class="error">${err.message}</p>`;
    console.error("Failed to load order:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  const orderRef = getOrderReferenceFromURL();
  if (!orderRef) {
    orderDetailsContainer.innerHTML = `<p>No order reference found in URL.</p>`;
    return;
  }

  fetchOrderDetails(orderRef);
});
