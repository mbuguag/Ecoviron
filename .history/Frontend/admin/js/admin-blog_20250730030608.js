// Use the same API_BASE from dashboard.js
const API_BASE = {
  blogs: "http://localhost:8080/api/blogs",
  blogImage: "http://localhost:8080/api/images/upload/blog"
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const postsList = document.getElementById("posts-list");
  const pagination = document.getElementById("admin-pagination");
  const newPostBtn = document.getElementById("new-post-btn");
  const editorModal = document.getElementById("editor-modal");
  const postForm = document.getElementById("post-form");
  const statusFilter = document.getElementById("status-filter");

  // State variables
  let currentPage = 1;
  const pageSize = 10;
  let posts = [];
  let editor; // Rich text editor instance

  // Initialize
  loadPosts();
  initEditor();
  setupEventListeners();

  async function loadPosts() {
    try {
      showLoading();

      const status = statusFilter.value !== "all" ? statusFilter.value : null;
      const url = new URL(API_BASE.blogs);
      url.searchParams.append('page', currentPage - 1);
      url.searchParams.append('size', pageSize);
      if (status) url.searchParams.append('status', status);

      const response = await authFetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle paginated response
      if (data.content && Array.isArray(data.content)) {
        posts = data.content;
        const totalPages = data.totalPages || 1;
        renderPosts();
        renderPagination(totalPages, currentPage);
      } else {
        throw new Error("Invalid data structure in response");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts. Please try again.");
    }
  }

  function renderPosts() {
    postsList.innerHTML = "";

    if (!posts || posts.length === 0) {
      postsList.innerHTML =
        '<tr><td colspan="6" class="no-posts">No blog posts found</td></tr>';
      return;
    }

    posts.forEach((post) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${post.title || "Untitled"}</td>
        <td>${post.author?.fullName || "Unknown"}</td>
        <td><span class="status-badge ${
          post.status?.toLowerCase() || "draft"
        }">${post.status || "DRAFT"}</span></td>
        <td>${
          post.publishedAt ? formatDate(post.publishedAt) : "Not published"
        }</td>
        <td>${post.viewCount || 0}</td>
        <td class="actions">
          <button class="btn-icon edit-btn" data-id="${post.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-btn" data-id="${post.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      postsList.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.id) openEditor(btn.dataset.id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.id) confirmDelete(btn.dataset.id);
      });
    });
  }

  function initEditor() {
    editor = new Quill("#post-content-editor", {
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      theme: "snow",
      placeholder: "Write your blog post content here...",
    });
  }

  async function openEditor(postId = null) {
    const isEdit = postId !== null;
    document.getElementById("editor-title").textContent = isEdit
      ? "Edit Post"
      : "New Post";

    if (isEdit) {
      try {
        const response = await authFetch(`${API_BASE.blogs}/${postId}`);
        if (!response.ok) throw new Error("Failed to load post");
        
        const post = await response.json();
        
        document.getElementById("post-id").value = post.id;
        document.getElementById("post-title").value = post.title;
        document.getElementById("post-slug").value = post.slug;
        document.getElementById("post-status").value = post.status || "DRAFT";
        document.getElementById("post-snippet").value = post.snippet;
        document.getElementById("meta-description").value =
          post.metaDescription || "";
        document.getElementById("post-tags").value =
          post.tags?.join(", ") || "";

        if (post.publishedAt) {
          const date = new Date(post.publishedAt);
          document.getElementById("publish-date").value = date.toISOString().slice(0, 16);
        }

        editor.root.innerHTML = post.content || "";

        if (post.imageUrl) {
          document.getElementById("image-preview").src = 
            post.imageUrl.startsWith('http') ? post.imageUrl : `${BACKEND_URL}${post.imageUrl}`;
          document.getElementById("image-preview").style.display = "block";
        }
      } catch (error) {
        console.error("Error loading post:", error);
        alert("Failed to load post data");
        return;
      }
    } else {
      postForm.reset();
      editor.root.innerHTML = "";
      document.getElementById("image-preview").src = "";
      document.getElementById("image-preview").style.display = "none";
      document.getElementById("post-id").value = "";
    }

    editorModal.style.display = "block";
  }

  async function savePost(event) {
    event.preventDefault();

    try {
      const postId = document.getElementById("post-id").value;
      const isEdit = postId !== "";

      const formData = new FormData();
      formData.append("title", document.getElementById("post-title").value);
      formData.append("slug", document.getElementById("post-slug").value);
      formData.append("status", document.getElementById("post-status").value);
      formData.append("snippet", document.getElementById("post-snippet").value);
      formData.append("content", editor.root.innerHTML);
      formData.append("metaDescription", document.getElementById("meta-description").value);

      const tags = document.getElementById("post-tags").value;
      if (tags) {
        tags.split(",").forEach((tag) => {
          formData.append("tags", tag.trim());
        });
      }

      const publishDate = document.getElementById("publish-date").value;
      if (publishDate) {
        formData.append("publishedAt", new Date(publishDate).toISOString());
      }

      const imageFile = document.getElementById("image-upload").files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEdit ? `${API_BASE.blogs}/${postId}` : API_BASE.blogs;
      const method = isEdit ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save post");
      }

      closeEditor();
      loadPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert(`Error: ${error.message}`);
    }
  }

  async function confirmDelete(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const response = await authFetch(`${API_BASE.blogs}/${postId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      loadPosts();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete post. Please try again.");
    }
  }

  function setupEventListeners() {
    // New post button
    newPostBtn.addEventListener("click", () => openEditor());

    // Modal close buttons
    document.querySelector(".close-btn").addEventListener("click", closeEditor);
    document
      .getElementById("cancel-btn")
      .addEventListener("click", closeEditor);

    // Form submission
    postForm.addEventListener("submit", savePost);

    // Status filter change
    statusFilter.addEventListener("change", () => {
      currentPage = 1;
      loadPosts();
    });

    // Image upload preview
    document
      .getElementById("image-upload")
      .addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            document.getElementById("image-preview").src = event.target.result;
            document.getElementById("image-preview").style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      });

    // Auto-generate slug from title
    document.getElementById("post-title").addEventListener("blur", function () {
      if (!document.getElementById("post-slug").value) {
        const slug = this.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        document.getElementById("post-slug").value = slug;
      }
    });
  }

  function createPaginationButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  function showLoading() {
    postsList.innerHTML = `
      <tr>
        <td colspan="6" class="loading">
          <div class="spinner"></div>
          Loading posts...
        </td>
      </tr>
    `;
  }

  function showError(message) {
    postsList.innerHTML = `
      <tr>
        <td colspan="6" class="error">
          <i class="fas fa-exclamation-triangle"></i>
          ${message}
        </td>
      </tr>
    `;
  }
});
