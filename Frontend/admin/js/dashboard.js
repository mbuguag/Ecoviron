const BACKEND_URL = "http://localhost:8080";

const API_BASE = {
  dashboard: `${BACKEND_URL}/api/admin/summary`,
  products: `${BACKEND_URL}/api/admin/products`,
  publicProducts: `${BACKEND_URL}/api/products`,
  orders: `${BACKEND_URL}/api/orders`,
  users: `${BACKEND_URL}/api/users`,
  blogs: `${BACKEND_URL}/api/blogs`,
  uploadImage: `${BACKEND_URL}/api/images/blog`,
};

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
    case "blogs":
      loadBlogs();
      break;
  }
}

let chartInstance = null;
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
    });
}

function loadProducts() {
  authFetch(API_BASE.products)
    .then((res) => res.json())
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
          </td>`;
        table.appendChild(row);
      });
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
  if (!token) return alert("You must be logged in as admin.");

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
    .then((res) => res.json())
    .then(() => {
      resetForm();
      loadProducts();
    });
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
    });
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" }).then(
      (res) => res.ok && loadProducts()
    );
  }
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Add Product";
}

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
          <td><button onclick="markShipped(${order.id})">Mark as Shipped</button></td>`;
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

function loadUsers() {
  authFetch(API_BASE.users)
    .then((res) => res.json())
    .then((users) => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";
      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>`;
        tbody.appendChild(row);
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
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${blog.title}</td>
          <td>${blog.snippet}</td>
          <td><img src="${BACKEND_URL}${blog.imageUrl}" width="50"/></td>
          <td>
            <button class="edit-blog-btn" data-id="${blog.id}">Edit</button>
            <button onclick="deleteBlog(${blog.id})">Delete</button>
          </td>`;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".edit-blog-btn").forEach((btn) =>
        btn.addEventListener("click", () => {
          const blogId = btn.dataset.id;
          if (blogId) {
            loadBlogForEdit(blogId);
          }
        })
      );
    })
    .catch((err) => console.error("Error loading blogs:", err));
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

function saveBlog() {
  const id = document.getElementById("blogId").value;
  const title = document.getElementById("title").value;
  const snippet = document.getElementById("snippet").value;
  const link = document.getElementById("link").value;
  const imageInput = document.getElementById("imageInput");
  if (!quill) return alert("Editor is not ready yet. Try reloading the page.");
  const content = quill.root.innerHTML;

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  fetch(API_BASE.uploadImage, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((imageUrl) => {
      const payload = { title, snippet, link, imageUrl, content };
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE.blogs}/${id}` : API_BASE.blogs;

      authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(() => {
        resetBlogForm();
        loadBlogs();
      });
    });
}

function deleteBlog(id) {
  if (confirm("Delete this blog post?")) {
    authFetch(`${API_BASE.blogs}/${id}`, { method: "DELETE" }).then(() =>
      loadBlogs()
    );
  }
}

function resetBlogForm() {
  document.getElementById("blogForm").reset();
  document.getElementById("blogId").value = "";
  if (quill) quill.root.innerHTML = "";
  document.getElementById("submitBtn").textContent = "Publish Blog";
  document.getElementById("cancelEdit").style.display = "none";
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.markShipped = markShipped;
window.showSection = showSection;
window.resetForm = resetForm;
window.deleteBlog = deleteBlog;
