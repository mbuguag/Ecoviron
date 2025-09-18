// order-success.js
import { layoutLoaded } from "./main.js";
import { API_BASE_URL, BASE_PATH, formatPrice, getQueryParam } from "./apiConfig.js";

// DOM container
const container = document.getElementById("order-details");

/**
 * Format datetime in a human-readable way
 */
function formatDateTime(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr || "N/A";
  }
}

/**
 * Render order details into the DOM
 */
function renderOrderDetails(order) {
  if (!order) {
    container.innerHTML = `<p class="error">No order details available.</p>`;
    return;
  }

  const {
    orderReference,
    orderDate,
    customerName,
    shippingAddress,
    status,
    totalAmount,
    items = []
  } = order;

  let html = `
    <h2>Order Confirmation</h2>
    <div class="order-meta">
      <p><strong>Reference:</strong> ${orderReference || "N/A"}</p>
      <p><strong>Date:</strong> ${formatDateTime(orderDate)}</p>
      <p><strong>Customer:</strong> ${customerName || "N/A"}</p>
      <p><strong>Status:</strong> ${status || "PENDING"}</p>
      <p><strong>Shipping Address:</strong> ${shippingAddress || "N/A"}</p>
    </div>

    <h3>Items</h3>
    <ul class="order-items">`;

  items.forEach((item) => {
    const productName = item.productName || "Unnamed product";
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    const subtotal = quantity * price;

    html += `
      <li class="order-item flex justify-between">
        <span>${quantity} × ${productName}</span>
        <span>${formatPrice(subtotal)}</span>
      </li>`;
  });

  html += `</ul>
    <div class="order-total mt-4">
      <strong>Total Paid:</strong> ${formatPrice(totalAmount)}
    </div>`;

  container.innerHTML = html;
}

/**
 * Fetch order details by reference
 */
async function fetchOrderDetails(ref) {
  if (!ref) {
    container.innerHTML = `<p>No order reference found in URL.</p>`;
    return;
  }

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    container.innerHTML = `<p>You must be logged in to view this order.</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Order not found (status ${res.status})`);
    }

    const order = await res.json();
    renderOrderDetails(order);
  } catch (err) {
    console.error("Failed to load order:", err);
    container.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
  }
}

/**
 * Initialize
 */
document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  const orderRef = getQueryParam("ref");
  const token = localStorage.getItem("jwtToken");

  // Show "View Orders" only if logged in
  const viewOrdersBtn = document.getElementById("view-orders-btn");
  if (token && viewOrdersBtn) {
    viewOrdersBtn.style.display = "inline-block";
    viewOrdersBtn.href = `${BASE_PATH}profile.html#orders`;
  }

  fetchOrderDetails(orderRef);
});
