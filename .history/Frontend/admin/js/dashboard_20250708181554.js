// dashboard.js
import { API_BASE, authFetch, BACKEND_URL } from "./utils.js";
import { loadProducts, saveProduct } from "./product-admin.js";

let quill;

function initQuillEditor() {
  const editorContainer = document.getElementById("editor");
  if (editorContainer && typeof Quill !== "undefined") {
    quill = new Quill(editorContainer, { theme: "snow" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");
  initQuillEditor();

  document.getElementById("productForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct();
  });

  document.getElementById("blogForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveBlog();
  });

  document
    .getElementById("cancelEdit")
    ?.addEventListener("click", resetBlogForm);
});

export function showSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  switch (sectionId) {
    case "dashboard":
      loadDashboard();
      break;
    case "products":
      loadProducts();
      break;
    case "orders":
      loadOrders();
      break;
    case "users":
      loadUsers();
      break;
    case "blogs":
      loadBlogs();
      break;
    case "contacts":
      loadContactMessages();
      break;
    case "quotes":
      loadQuotes();
      break;
  }
}

function loadDashboard() {
  authFetch(API_BASE.dashboard)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById(
        "total-orders"
      ).innerText = `Total Orders: ${data.totalOrders}`;
      document.getElementById(
        "total-users"
      ).innerText = `Total Users: ${data.totalUsers}`;
      document.getElementById(
        "total-products"
      ).innerText = `Total Products: ${data.totalProducts}`;

      const ctx = document.getElementById("orderChart").getContext("2d");
      if (window.chartInstance) window.chartInstance.destroy();
      window.chartInstance = new Chart(ctx, {
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
      });
    });
}

function loadOrders() {
  authFetch(API_BASE.orders)
    .then((res) => res.json())
    .then((orders) => {
      const tbody = document.querySelector("#orderTable tbody");
      tbody.innerHTML = "";
      orders.forEach((order) => {
        tbody.innerHTML += `
          <tr>
            <td>${order.id}</td>
            <td>${order.userEmail}</td>
            <td>$${order.total}</td>
            <td>${order.status}</td>
            <td><button onclick="markShipped(${order.id})">Mark as Shipped</button></td>
          </tr>`;
      });
    });
}

export function markShipped(orderId) {
  authFetch(`${API_BASE.orders}/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SHIPPED" }),
  }).then(loadOrders);
}

function loadUsers() {
  authFetch(API_BASE.users)
    .then((res) => res.json())
    .then((users) => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";
      users.forEach((user) => {
        tbody.innerHTML += `
          <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
          </tr>`;
      });
    });
}

function loadBlogs() {
  authFetch(API_BASE.blogs)
    .then((res) => res.json())
    .then((blogs) => {
      const tbody = document.querySelector("#blogList");
      tbody.innerHTML = "";
      blogs.forEach((blog) => {
        tbody.innerHTML += `
          <tr>
            <td>${blog.title}</td>
            <td>${blog.snippet}</td>
            <td><img src="${BACKEND_URL}${blog.imageUrl}" width="50"/></td>
            <td>
              <button class="edit-blog-btn" data-id="${blog.id}">Edit</button>
              <button onclick="deleteBlog(${blog.id})">Delete</button>
            </td>
          </tr>`;
      });

      document
        .querySelectorAll(".edit-blog-btn")
        .forEach((btn) =>
          btn.addEventListener("click", () => loadBlogForEdit(btn.dataset.id))
        );
    });
}

function loadBlogForEdit(id) {
  authFetch(`${API_BASE.blogs}/${id}`)
    .then((res) => res.json())
    .then((blog) => {
      document.getElementById("blogId").value = blog.id;
      document.getElementById("title").value = blog.title;
      document.getElementById("snippet").value = blog.snippet;
      document.getElementById("link").value = blog.link;
      if (quill) quill.root.innerHTML = blog.content;
      document.getElementById("submitBtn").textContent = "Update Blog";
      document.getElementById("cancelEdit").style.display = "inline-block";
    });
}

function resetBlogForm() {
  document.getElementById("blogForm").reset();
  document.getElementById("blogId").value = "";
  if (quill) quill.root.innerHTML = "";
  document.getElementById("submitBtn").textContent = "Publish Blog";
  document.getElementById("cancelEdit").style.display = "none";
}

export function deleteBlog(id) {
  if (confirm("Delete this blog post?")) {
    authFetch(`${API_BASE.blogs}/${id}`, { method: "DELETE" }).then(loadBlogs);
  }
}

function loadContactMessages() {
  authFetch(API_BASE.contactMessages)
    .then((res) => res.json())
    .then((messages) => {
      const tbody = document.getElementById("contactMessagesBody");
      tbody.innerHTML = "";
      messages.forEach((msg) => {
        tbody.innerHTML += `
          <tr>
            <td>${msg.id}</td>
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.phone}</td>
            <td>${msg.message}</td>
            <td>${new Date(msg.date).toLocaleString()}</td>
          </tr>`;
      });
    });
}

function loadQuotes() {
  authFetch(API_BASE.quotes)
    .then((res) => res.json())
    .then((quotes) => {
      console.table(quotes); // Add DOM handling if needed
    });
}

window.showSection = showSection;
window.markShipped = markShipped;
window.deleteBlog = deleteBlog;
