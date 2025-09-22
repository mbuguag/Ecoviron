// order-pending.js
import { API_BASE_URL, BASE_PATH, formatPrice } from "./apiConfig.js";
import { showToast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderRef = urlParams.get("orderRef");

  if (!orderRef) {
    document.getElementById("order-details").innerHTML =
      `<p class="text-red-500">❌ No order reference found.</p>`;
    return;
  }

  // Initial load
  loadOrder(orderRef);

  // Refresh button
  document.getElementById("refresh-status").addEventListener("click", () => {
    loadOrder(orderRef, true);
  });

  // Auto-refresh every 5s
  setInterval(() => loadOrder(orderRef), 5000);
});

/**
 * Fetch order details
 */
async function loadOrder(orderRef, manual = false) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    showToast("⚠ Please log in to view your order.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderRef}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch order");

    const order = await res.json();
    renderOrder(order);

    if (order.status === "PAID") {
      showToast("✅ Payment confirmed! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = `${BASE_PATH}ecommerce/order-success.html?orderRef=${encodeURIComponent(orderRef)}`;
      }, 2000);
    } else if (order.status === "FAILED") {
      showToast("❌ Payment failed. Redirecting...", "error");
      setTimeout(() => {
        window.location.href = `${BASE_PATH}ecommerce/order-failed.html?orderRef=${encodeURIComponent(orderRef)}`;
      }, 2000);
    } else if (manual) {
      showToast("ℹ Order still pending payment.", "info");
    }
  } catch (err) {
    console.error("Order fetch error:", err);
    showToast("❌ Could not load order details.", "error");
  }
}

/**
 * Render order details into DOM
 */
function renderOrder(order) {
  const container = document.getElementById("order-details");
  container.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">Order Reference: <span class="text-blue-600">${order.orderReference}</span></h2>
    <p class="mb-2"><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
    <p class="mb-2"><strong>Status:</strong> 
      <span class="px-2 py-1 rounded ${
        order.status === "PENDING"
          ? "bg-yellow-100 text-yellow-800"
          : order.status === "PAID"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }">${order.status}</span>
    </p>

    <div class="mt-4">
      <h3 class="font-semibold mb-2">Items:</h3>
      <ul class="space-y-2">
        ${order.items
          .map(
            (item) => `
          <li class="flex justify-between border-b pb-2">
            <span>${item.productName} × ${item.quantity}</span>
            <span>${formatPrice(item.price)}</span>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>

    <div class="mt-4 font-bold text-lg flex justify-between">
      <span>Total:</span>
      <span>${formatPrice(order.totalAmount)}</span>
    </div>
  `;
}
