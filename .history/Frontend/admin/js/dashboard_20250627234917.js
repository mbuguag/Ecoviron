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
document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");

  // Init Quill only if element exists
  const editorContainer = document.getElementById("editor");
  if (editorContainer && typeof Quill !== "undefined") {
    quill = new Quill(editorContainer, { theme: "snow" });
  }

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

function loadBlogs() {
  authFetch(API_BASE.blogs)
    .then((res) => res.json())
    .then((blogs) => {
      const tbody = document.getElementById("blogList");
      tbody.innerHTML = "";
      blogs.forEach((blog) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${blog.title}</td>
          <td>${blog.snippet}</td>
          <td><img src="${BACKEND_URL}${blog.imageUrl}" width="50"/></td>
          <td>
            <button onclick='editBlog(${JSON.stringify(blog)})'>Edit</button>
            <button onclick='deleteBlog(${blog.id})'>Delete</button>
          </td>`;
        tbody.appendChild(row);
      });
    })
    .catch((err) => console.error("Error loading blogs:", err));
}

function saveBlog() {
  const id = document.getElementById("blogId").value;
  const title = document.getElementById("title").value;
  const snippet = document.getElementById("snippet").value;
  const link = document.getElementById("link").value;
  const imageInput = document.getElementById("imageInput");
  const content = quill?.root.innerHTML || "";

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

function editBlog(blog) {
  document.getElementById("blogId").value = blog.id;
  document.getElementById("title").value = blog.title;
  document.getElementById("snippet").value = blog.snippet;
  document.getElementById("link").value = blog.link;
  if (quill) quill.root.innerHTML = blog.content;
  document.getElementById("submitBtn").textContent = "Update Blog";
  document.getElementById("cancelEdit").style.display = "inline-block";
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

window.showSection = showSection;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
