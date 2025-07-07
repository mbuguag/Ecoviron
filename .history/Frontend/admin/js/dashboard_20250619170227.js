function showSection(sectionId) {
  const sections = document.querySelectorAll(".admin-section");
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  // Load relevant data on section switch
  switch (sectionId) {
    case "dashboard": loadDashboard(); break;
    case "products": loadProducts(); break;
    case "orders": loadOrders(); break;
    case "users": loadUsers(); break;
  }
}

const BACKEND_URL = "http://localhost:8080";

const API_BASE = {
  dashboard: `${BACKEND_URL}/api/admin/summary`,
  products: `${BACKEND_URL}/api/products`,
  orders: `${BACKEND_URL}/api/orders`,
  users: `${BACKEND_URL}/api/users`,
};


// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");

  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct();
  });
});

// === DASHBOARD ===
function loadDashboard() {
  const token = localStorage.getItem("token");

  fetch(API_BASE.dashboard, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
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
      new Chart(ctx, {
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
  fetch(API_BASE.products)
    .then(res => res.json())
    .then(products => {
      const table = document.querySelector("#productTable tbody");
      table.innerHTML = "";

      products.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>${p.price}</td>
          <td>${p.category}</td>
          <td><img src="${p.imageUrl}" width="50"/></td>
          <td>
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        `;
        table.appendChild(row);
      });
    });
}

function saveProduct() {
  const product = {
    name: document.getElementById("productName").value,
    description: document.getElementById("productDescription").value,
    price: parseFloat(document.getElementById("productPrice").value),
    imageUrl: document.getElementById("productImageUrl").value,
    category: document.getElementById("productCategory").value
  };

  const id = document.getElementById("productId").value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_BASE.products}/${id}` : API_BASE.products;

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  })
    .then(() => {
      resetForm();
      loadProducts();
    });
}

function editProduct(id) {
  fetch(`${API_BASE.products}/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById("formTitle").textContent = "Edit Product";
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productImageUrl").value = product.imageUrl;
      document.getElementById("productCategory").value = product.category;
    });
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`${API_BASE.products}/${id}`, { method: "DELETE" })
      .then(() => loadProducts());
  }
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Add Product";
}

// === ORDERS ===
function loadOrders() {
  fetch(API_BASE.orders)
    .then(res => res.json())
    .then(orders => {
      const tbody = document.querySelector("#orderTable tbody");
      tbody.innerHTML = "";

      orders.forEach(order => {
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
  fetch(`${API_BASE.orders}/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SHIPPED" })
  })
    .then(() => loadOrders());
}

// === USERS ===
function loadUsers() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found");
    return;
  }

  fetch(API_BASE.users, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
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
    .catch((err) => {
      console.error("Error fetching users:", err);
    });
}

