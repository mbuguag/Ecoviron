// dashboard.js
import { API_BASE_URL } from '/frontend/j';

// ✅ Use centralized API configuration
export const API_BASE = {
  dashboard: `${API_BASE_URL}/admin/summary`,
  products: `${API_BASE_URL}/admin/products`,
  uploadProduct: `${API_BASE_URL}/admin/products/upload`,
  blogs: `${API_BASE_URL}/admin-blogs`,
  orders: `${API_BASE_URL}/orders`,
  users: `${API_BASE_URL}/users`,
  contacts: `${API_BASE_URL}/contact/admin/messages`,
  quotes: `${API_BASE_URL}/admin/quote-requests`,
  blogImage: `${API_BASE_URL}/images/upload/blog`,
};

// ✅ Safe JSON parser for better error messages
function safeJson(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Your session has expired. Please log in again.");
    window.location.href = "/login.html";
    return Promise.reject("Missing token");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
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
  authFetch(API_BASE.dashboard)
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

// === Product Management ===
function loadProducts() {
  authFetch(API_BASE.products)
    .then(safeJson)
    .then((products) => {
      const tbody = document.querySelector("#productTable tbody");
      tbody.innerHTML = "";

      products.forEach(async (p) => {
        try {
          const orderCount = await authFetch(`${API_BASE.products}/${p.id}/order-count`).then(safeJson);

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.description}</td>
            <td>${p.price}</td>
            <td>${p.category?.name || "—"}</td>
            <td><img src="${p.imageUrl}" width="50" /></td>
            <td>${orderCount}</td>
            <td>
              <button onclick="editProduct(${p.id})">Edit</button>
              <button onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        } catch (err) {
          console.error("Failed to load order count for product", p.id, err);
        }
      });
    })
    .catch((err) => alert("Failed to load products: " + err.message));
}

function saveProduct() {
  const form = document.getElementById("productForm");
  const formData = new FormData(form);
  const isEditing = !!form.productId.value;

  if (isEditing && !form.productImage.files[0]) {
    const existingImage = document
      .querySelector(`#productTable tr[data-id="${form.productId.value}"] img`)
      ?.getAttribute("src")
      ?.replace(API_BASE_URL.replace('/api', ''), "");
    if (existingImage) {
      formData.append("existingImageUrl", existingImage);
    }
  }

  const method = isEditing ? "PUT" : "POST";
  const url = isEditing ? `${API_BASE.products}/${form.productId.value}` : API_BASE.uploadProduct;

  authFetch(url, { method, body: formData })
    .then(safeJson)
    .then(() => {
      form.reset();
      form.productId.value = "";
      loadProducts();
    })
    .catch((err) => alert("Error saving product: " + err.message));
}

function editProduct(id) {
  authFetch(`${API_BASE.products}/${id}`)
    .then(safeJson)
    .then((p) => {
      const form = document.getElementById("productForm");
      form.productId.value = p.id;
      form.productName.value = p.name;
      form.productDescription.value = p.description;
      form.productPrice.value = p.price;
      form.productStock.value = p.stock;
      form.productFeatured.checked = p.featured;
      form.productCategoryId.value = p.category?.id || "";
      form.existingImageUrl.value = p.imageUrl || "";
    })
    .catch((err) => alert("Failed to load product: " + err.message));
}

function deleteProduct(id) {
  authFetch(`${API_BASE.products}/${id}/order-count`)
    .then(safeJson)
    .then((count) => {
      if (count > 0) {
        alert(`This product has been ordered ${count} time(s) and cannot be deleted.`);
        return;
      }
      if (!confirm("This product has no orders. Delete this product?")) return;
      return authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" });
    })
    .then((res) => { if (res) loadProducts(); })
    .catch((err) => alert("Error deleting product: " + err.message));
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.resetForm = () => document.getElementById("productForm").reset();

// === Blog Management ===
function saveBlog() {
  const id = document.getElementById("blogId").value;
  const title = document.getElementById("title").value;
  const snippet = document.getElementById("snippet").value;
  const link = document.getElementById("link").value;
  const content = quill.root.innerHTML;
  const imageFile = document.getElementById("imageInput").files[0];

  if (!imageFile && !id) return alert("Please choose a blog image");

  const handleSave = (imageUrl) => {
    const payload = { title, snippet, content, link, imageUrl };
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE.blogs}/${id}` : API_BASE.blogs;

    authFetch(url, { method, body: JSON.stringify(payload) })
      .then(safeJson)
      .then(() => { resetBlogForm(); loadBlogs(); })
      .catch(() => alert("Blog save failed"));
  };

  if (imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile);
    authFetch(API_BASE.blogImage, { method: "POST", body: formData })
      .then((res) => res.text())
      .then(handleSave)
      .catch(() => alert("Failed to upload blog image"));
  } else {
    handleSave(null);
  }
}

function loadBlogs() {
  authFetch(API_BASE.blogs)
    .then(safeJson)
    .then((blogs) => {
      const tbody = document.getElementById("blogList");
      tbody.innerHTML = "";
      blogs.forEach((b) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${b.title}</td>
          <td>${b.snippet}</td>
          <td><img src="${b.imageUrl}" width="50"/></td>
          <td>
            <button onclick="editBlog(${b.id})">Edit</button>
            <button onclick="deleteBlog(${b.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => alert("Failed to load blogs: " + err.message));
}

function editBlog(id) {
  authFetch(`${API_BASE.blogs}/${id}`)
    .then(safeJson)
    .then((b) => {
      document.getElementById("blogId").value = b.id;
      document.getElementById("title").value = b.title;
      document.getElementById("snippet").value = b.snippet;
      document.getElementById("link").value = b.link || "";
      quill.root.innerHTML = b.content;
      document.getElementById("submitBtn").textContent = "Update Blog";
      document.getElementById("cancelEdit").style.display = "inline-block";
    })
    .catch((err) => alert("Failed to load blog: " + err.message));
}

function deleteBlog(id) {
  if (!confirm("Delete this blog post?")) return;
  authFetch(`${API_BASE.blogs}/${id}`, { method: "DELETE" })
    .then(() => loadBlogs())
    .catch((err) => alert("Failed to delete blog: " + err.message));
}

function resetBlogForm() {
  document.getElementById("blogForm").reset();
  document.getElementById("blogId").value = "";
  quill.root.innerHTML = "";
  document.getElementById("submitBtn").textContent = "Publish Blog";
  document.getElementById("cancelEdit").style.display = "none";
}

window.editBlog = editBlog;
window.deleteBlog = deleteBlog;

// === Orders ===
function loadOrders() {
  authFetch(API_BASE.orders)
    .then(safeJson)
    .then((orders) => {
      const tbody = document.querySelector("#orderTable tbody");
      tbody.innerHTML = "";
      orders.forEach((o) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${o.id}</td>
          <td>${o.userEmail}</td>
          <td>${formatPrice(o.totalAmount)}</td>
          <td>${o.status}</td>
          <td><button onclick="markShipped(${o.id})">Mark Shipped</button></td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => alert("Failed to load orders: " + err.message));
}

function markShipped(id) {
  authFetch(`${API_BASE.orders}/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "SHIPPED" }),
  })
    .then(safeJson)
    .then(() => loadOrders())
    .catch((err) => alert("Failed to mark shipped: " + err.message));
}
window.markShipped = markShipped;

// === Users ===
function loadUsers() {
  authFetch(API_BASE.users)
    .then(safeJson)
    .then((users) => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";
      users.forEach((u) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>`;
        tbody.appendChild(row);
      });
    })
    .catch((err) => alert("Failed to load users: " + err.message));
}

// === Contacts ===
function loadContactMessages() {
  authFetch(API_BASE.contacts)
    .then(safeJson)
    .then((messages) => {
      const tbody = document.getElementById("contactMessagesBody");
      tbody.innerHTML = "";
      messages.forEach((m) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${m.id}</td>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone}</td>
          <td>${m.message}</td>
          <td>${new Date(m.submittedAt).toLocaleString()}</td>`;
        tbody.appendChild(row);
      });
    })
    .catch((err) => alert("Failed to load messages: " + err.message));
}

// === Quotes ===
function loadQuotes() {
  authFetch(API_BASE.quotes)
    .then(safeJson)
    .then((quotes) => {
      const container = document.getElementById("quoteRequestsContainer");
      container.innerHTML = "";
      quotes.forEach((q) => {
        const div = document.createElement("div");
        div.classList.add("quote-entry");
        div.innerHTML = `
          <strong>${q.name}</strong> (${q.email})<br/>
          <p><strong>Service:</strong> ${q.service}</p>
          <p>${q.message}</p>
          <small>${new Date(q.submittedAt).toLocaleString()}</small>
        `;
        container.appendChild(div);
      });
    })
    .catch((err) => alert("Failed to load quotes: " + err.message));
}

window.showSection = showSection;