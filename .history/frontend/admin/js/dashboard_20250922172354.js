// dashboard.js
import { API_ENDPOINTS, fetchJson, formatPrice } from "./apiConfig.js";

// ✅ Chart.js global instance placeholder
let orderChartInstance = null;

// ✅ Initialize landing dashboard
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Admin Dashboard Loaded");

  // Load mock dashboard for now
  loadDashboardMock();
});

/**
 * ==========================
 * MOCK DASHBOARD DATA
 * ==========================
 */
function loadDashboardMock() {
  const mockSummary = {
    totalOrders: 152,
    totalUsers: 87,
    totalProducts: 34,
    orderStatus: {
      pending: 23,
      shipped: 45,
      delivered: 84,
    },
    revenue: 560000,
  };

  renderDashboard(mockSummary);
}

/**
 * ==========================
 * REAL DASHBOARD FETCH
 * ==========================
 */
async function loadDashboard() {
  try {
    const summary = await fetchJson(API_ENDPOINTS.admin.dashboard);
    renderDashboard(summary);
  } catch (err) {
    console.error("❌ Failed to load dashboard:", err);
  }
}

/**
 * ==========================
 * RENDER DASHBOARD WIDGETS
 * ==========================
 */
function renderDashboard(data) {
  // Top stats
  document.getElementById("total-orders").textContent = data.totalOrders;
  document.getElementById("total-users").textContent = data.totalUsers;
  document.getElementById("total-products").textContent = data.totalProducts;
  document.getElementById("total-revenue").textContent = formatPrice(data.revenue);

  // Order status chart
  const ctx = document.getElementById("orderChart").getContext("2d");

  if (orderChartInstance) {
    orderChartInstance.destroy();
  }

  orderChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pending", "Shipped", "Delivered"],
      datasets: [
        {
          label: "Order Status",
          data: [
            data.orderStatus.pending,
            data.orderStatus.shipped,
            data.orderStatus.delivered,
          ],
          backgroundColor: ["orange", "blue", "green"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// Expose real loader for future use
window.loadDashboard = loadDashboard;
