// dashboard.js
import { API_ENDPOINTS, authFetch } from "../js";

// ✅ Safe JSON parser for better error messages
function safeJson(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let quill;

function initQuillEditor() {
  const editorContainer = document.getElementById("editor");
  if (editorContainer) {
    quill = new Quill(editorContainer, { theme: "snow" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initQuillEditor();
  showSection("dashboard");

  document.getElementById("productForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct();
  });

  document.getElementById("blogForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveBlog();
  });

  document.getElementById("cancelEdit")?.addEventListener("click", resetBlogForm);
});

function showSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach((sec) => {
    sec.style.display = sec.id === sectionId ? "block" : "none";
  });

  switch (sectionId) {
    case "dashboard": loadDashboard(); break;
    case "products": loadProducts(); break;
    case "orders": loadOrders(); break;
    case "users": loadUsers(); break;
    case "blogs": loadBlogs(); break;
    case "contacts": loadContactMessages(); break;
    case "quotes": loadQuotes(); break;
  }
}

// === Dashboard ===
function loadDashboard() {
  authFetch(API_ENDPOINTS.admin.dashboard)
    .then(safeJson)
    .then((data) => {
      document.getElementById("total-orders").innerText = `Total Orders: ${data.totalOrders}`;
      document.getElementById("total-users").innerText = `Total Users: ${data.totalUsers}`;
      document.getElementById("total-products").innerText = `Total Products: ${data.totalProducts}`;

      const ctx = document.getElementById("orderChart").getContext("2d");
      if (window.chartInstance) window.chartInstance.destroy();
      window.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Pending", "Shipped", "Delivered"],
          datasets: [
            {
              label: "Order Status",
              data: [data.orderStatus.pending, data.orderStatus.shipped, data.orderStatus.delivered],
              backgroundColor: ["orange", "blue", "green"],
            },
          ],
        },
      });
    })
    .catch((err) => alert("Failed to load dashboard: " + err.message));
}
