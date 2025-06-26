const BACKEND_URL = "http://localhost:8080";

const API_BASE = {
  dashboard: `${BACKEND_URL}/api/admin/summary`,
  products: `${BACKEND_URL}/api/admin/products`,
  publicProducts: `${BACKEND_URL}/api/products`,
  orders: `${BACKEND_URL}/api/orders`,
  users: `${BACKEND_URL}/api/users`,
};

// === Helper: Authenticated Fetch ===
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found for authenticated request");

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");
  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct();
  });
});

// === Section Display ===
function showSection(sectionId) {
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
  }
}

// === DASHBOARD ===
let chartInstance = null;

function loadDashboard() {
  authFetch(API_BASE.dashboard)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    })
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
      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(ctx, {
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
    })
    .catch((err) => console.error("Failed to load dashboard data", err));
}

// === PRODUCTS ===
function loadProducts() {
  authFetch(API_BASE.products)
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized or forbidden");
      return res.json();
    })
    .then((products) => {
      const table = document.querySelector("#productTable tbody");
      table.innerHTML = "";

      products.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>${p.price}</td>
          <td>${p.category?.name || ""}</td>
          <td><img src="${BACKEND_URL}${p.imageUrl}" width="50"/></td>
          <td>
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        `;
        table.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("Failed to load products:", err);
      alert("Access denied. Please log in as admin.");
    });
}


function saveProduct() {
  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value;
  const description = document.getElementById("productDescription").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value) || 0;
  const featured = document.getElementById("productFeatured").checked;
  const categoryId =
    parseInt(document.getElementById("productCategoryId").value) || null;

  const imageInput = document.getElementById("productImage");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in as admin.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("featured", featured);
  if (categoryId !== null) formData.append("categoryId", categoryId);
  if (imageInput.files.length > 0)
    formData.append("image", imageInput.files[0]);

  const isUpdate = Boolean(id);
  const url = isUpdate
    ? `${API_BASE.products}/${id}`
    : `${API_BASE.publicProducts}/upload`;

  fetch(url, {
    method: isUpdate ? "PUT" : "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
    .then((res) => {
      if (res.status === 204) return null;
      return res.json();
    })
    .then(() => {
      resetForm();
      loadProducts();
    })
    .catch((err) => console.error("Product save error:", err));
}

function editProduct(id) {
  authFetch(`${API_BASE.products}/${id}`)
    .then((res) => res.json())
    .then((product) => {
      document.getElementById("formTitle").textContent = "Edit Product";
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productStock").value = product.stock || 0;
      document.getElementById("productFeatured").checked =
        product.featured || false;
      document.getElementById("productCategoryId").value =
        product.category?.id || "";
    })
    .catch((err) => console.error("Failed to load product for editing:", err));
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.status === 204 || res.ok) loadProducts();
        else throw new Error("Failed to delete");
      })
      .catch((err) => console.error("Delete error:", err));
  }
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Add Product";
}

// === ORDERS ===
function loadOrders() {
  authFetch(API_BASE.orders)
    .then((res) => res.json())
    .then((orders) => {
      const tbody = document.querySelector("#orderTable tbody");
      tbody.innerHTML = "";

      orders.forEach((order) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${order.id}</td>
          <td>${order.userEmail}</td>
          <td>$${order.total}</td>
          <td>${order.status}</td>
          <td><button onclick="markShipped(${order.id})">Mark as Shipped</button></td>
        `;
        tbody.appendChild(row);
      });
    });
}

function markShipped(orderId) {
  authFetch(`${API_BASE.orders}/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SHIPPED" }),
  }).then(() => loadOrders());
}

// === USERS ===
function loadUsers() {
  authFetch(API_BASE.users)
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized or forbidden");
      return res.json();
    })
    .then((users) => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";

      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => console.error("Error fetching users:", err));
}

// === Expose globally ===
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.markShipped = markShipped;
window.showSection = showSection;
window.resetForm = resetForm;
