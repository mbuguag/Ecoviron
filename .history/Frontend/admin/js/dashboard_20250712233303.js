// dashboard.js
const BACKEND_URL = "http://localhost:8080";
export const API_BASE = {
  dashboard: `${BACKEND_URL}/api/admin/summary`,
  products: `${BACKEND_URL}/api/admin/products`,
  uploadProduct: `${BACKEND_URL}/api/admin/products/upload`,
  blogs: `${BACKEND_URL}/api/blogs`,
  orders: `${BACKEND_URL}/api/orders`,
  users: `${BACKEND_URL}/api/users`,
  contacts: `${BACKEND_URL}/api/contact/admin/messages`,
  quotes: `${BACKEND_URL}/api/admin/quotes`,
  blogImage: `${BACKEND_URL}/api/images/blog`,
};

export function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Your session has expired. Please log in again.");
    window.location.href = "/login.html";
    return Promise.reject("Missing token");
  }

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type":
        options.body instanceof FormData ? undefined : "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
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

  document
    .getElementById("cancelEdit")
    ?.addEventListener("click", resetBlogForm);
});

function showSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach((sec) => {
    sec.style.display = sec.id === sectionId ? "block" : "none";
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

// === Product Management ===

function loadProducts() {
  authFetch(API_BASE.products)
    .then((res) => res.json())
    .then((products) => {
      const tbody = document.querySelector("#productTable tbody");
      tbody.innerHTML = "";

      products.forEach(async (p) => {
        // Fetch order count per product
        const orderCountRes = await authFetch(
          `${API_BASE.products}/${p.id}/order-count`
        );
        const orderCount = await orderCountRes.json();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>${p.price}</td>
          <td>${p.category?.name || "—"}</td>
          <td><img src="${BACKEND_URL}${p.imageUrl}" width="50" /></td>
          <td>${orderCount}</td> <!-- Display order count -->
          <td>
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}


function saveProduct() {
  const form = document.getElementById("productForm");
  const formData = new FormData(form);
  const isEditing = !!form.productId.value;

  // If editing, include existing imageUrl (if no new file is selected)
  if (isEditing && !form.productImage.files[0]) {
    const existingImage = document
      .querySelector(`#productTable tr[data-id="${form.productId.value}"] img`)
      ?.getAttribute("src")
      ?.replace(BACKEND_URL, "");
    if (existingImage) {
      formData.append("existingImageUrl", existingImage);
    }
  }

  const method = isEditing ? "" "POST";
  const url = isEditing
    ? `${API_BASE.products}/${form.productId.value}`
    : API_BASE.uploadProduct;
  

  // ✅ Let the browser set the Content-Type for FormData
  authFetch(url, {
    method,
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save product");
      return res.json();
    })
    .then(() => {
      form.reset();
      form.productId.value = "";
      loadProducts();
    })
    .catch((err) => alert("Error saving product: " + err.message));
}



function editProduct(id) {
  authFetch(`${API_BASE.products}/${id}`)
    .then((res) => res.json())
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
    });
}


function deleteProduct(id) {
  // Step 1: Check order count before deleting
  authFetch(`${API_BASE.products}/${id}/order-count`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch order count");
      return res.json();
    })
    .then((count) => {
      if (count > 0) {
        alert(
          `This product has been ordered ${count} time(s) and cannot be deleted.`
        );
        return;
      }

      // Step 2: Confirm deletion if no orders
      if (!confirm("This product has no orders. Delete this product?")) return;

      return authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" });
    })
    .then((res) => {
      if (res) {
        loadProducts();
      }
    })
    .catch((err) => alert("Error: " + err.message));
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

    authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(() => {
        resetBlogForm();
        loadBlogs();
      })
      .catch((err) => alert("Blog save failed"));
  };

  if (imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    authFetch(API_BASE.blogImage, { method: "POST", body: formData })
      .then((res) => res.text())
      .then(handleSave);
  } else {
    handleSave(null); // for editing without image change
  }
}

function loadBlogs() {
  authFetch(API_BASE.blogs)
    .then((res) => res.json())
    .then((blogs) => {
      const tbody = document.getElementById("blogList");
      tbody.innerHTML = "";
      blogs.forEach((b) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${b.title}</td>
          <td>${b.snippet}</td>
          <td><img src="${BACKEND_URL}${b.imageUrl}" width="50"/></td>
          <td>
            <button onclick="editBlog(${b.id})">Edit</button>
            <button onclick="deleteBlog(${b.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}

function editBlog(id) {
  authFetch(`${API_BASE.blogs}/${id}`)
    .then((res) => res.json())
    .then((b) => {
      document.getElementById("blogId").value = b.id;
      document.getElementById("title").value = b.title;
      document.getElementById("snippet").value = b.snippet;
      document.getElementById("link").value = b.link || "";
      quill.root.innerHTML = b.content;
      document.getElementById("submitBtn").textContent = "Update Blog";
      document.getElementById("cancelEdit").style.display = "inline-block";
    });
}

function deleteBlog(id) {
  if (!confirm("Delete this blog post?")) return;
  authFetch(`${API_BASE.blogs}/${id}`, { method: "DELETE" }).then(loadBlogs);
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

// === Order Management ===

function loadOrders() {
  authFetch(API_BASE.orders)
    .then((res) => res.json())
    .then((orders) => {
      const tbody = document.querySelector("#orderTable tbody");
      tbody.innerHTML = "";
      orders.forEach((o) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${o.id}</td>
          <td>${o.userEmail}</td>
          <td>$${o.total}</td>
          <td>${o.status}</td>
          <td><button onclick="markShipped(${o.id})">Mark Shipped</button></td>
        `;
        tbody.appendChild(row);
      });
    });
}

function markShipped(id) {
  authFetch(`${API_BASE.orders}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SHIPPED" }),
  }).then(loadOrders);
}
window.markShipped = markShipped;

// === Users ===

function loadUsers() {
  authFetch(API_BASE.users)
    .then((res) => res.json())
    .then((users) => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";
      users.forEach((u) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>`;
        tbody.appendChild(row);
      });
    });
}

// === Contact Messages ===

function loadContactMessages() {
  authFetch(API_BASE.contacts)
    .then((res) => res.json())
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
          <td>${new Date(m.date).toLocaleString()}</td>`;
        tbody.appendChild(row);
      });
    });
}

// === Quotes ===

function loadQuotes() {
  authFetch(API_BASE.quotes)
    .then((res) => res.json())
    .then((quotes) => {
      const container = document.getElementById("quoteRequestsContainer");
      container.innerHTML = "";
      quotes.forEach((q) => {
        const div = document.createElement("div");
        div.classList.add("quote-entry");
        div.innerHTML = `
          <strong>${q.name}</strong> (${q.email})<br/>
          <em>${q.company}</em><br/>
          <p>${q.message}</p>
          <small>${new Date(q.date).toLocaleString()}</small>
        `;
        container.appendChild(div);
      });
    });
}

window.showSection = showSection;
