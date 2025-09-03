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

function renderOrderDetails(order) {
  const {
    orderReference,
    status,
    customerName,
    shippingAddress,
    createdAt,
    items,
  } = order;

  let html = `
    <div class="order-header">
      <p><strong>Order Ref:</strong> ${orderReference}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Date:</strong> ${new Date(createdAt).toLocaleString()}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
    </div>
    <hr>
    <h3>Items</h3>
    <ul class="order-items">`;

  let total = 0;

  for (const item of items) {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    html += `
      <li class="order-item">
        <span>${item.quantity} x ${item.name}</span>
        <span>${formatCurrency(subtotal)}</span>
      </li>`;
  }

  html += `</ul>
    <div class="order-total mt-2">
      <strong>Total:</strong> ${formatCurrency(total)}
    </div>`;

  orderDetailsContainer.innerHTML = html;
}

async function fetchOrderDetails(orderRef) {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token)
      return (orderDetailsContainer.innerHTML = `<p>You must be logged in to view this order.</p>`);

    const res = await fetch(`${API_BASE_URL}/orders/${orderRef}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Order not found or you don't have access.");
    }

    const order = await res.json();
    renderOrderDetails(order);
  } catch (err) {
    orderDetailsContainer.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  const orderRef = getOrderReferenceFromURL();
  if (!orderRef) {
    orderDetailsContainer.innerHTML =
      "<p>Order reference not found in URL.</p>";
    return;
  }

  fetchOrderDetails(orderRef);
});
