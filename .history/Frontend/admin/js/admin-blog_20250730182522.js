import { API_BASE, authFetch } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const postsList = document.getElementById("posts-list");
  const pagination = document.getElementById("admin-pagination");
  const newPostBtn = document.getElementById("new-post-btn");
  const editorModal = document.getElementById("editor-modal");
  const postForm = document.getElementById("post-form");
  const statusFilter = document.getElementById("status-filter");

  let currentPage = 1;
  const pageSize = 10;
  let posts = [];
  let editor;

  loadPosts();
  initEditor();
  setupEventListeners();

  async function loadPosts() {
    try {
      showLoading();
      const status = statusFilter.value !== "all" ? statusFilter.value : null;
      const url = `${API_BASE.blogs}?page=${currentPage - 1}&size=${pageSize}${
        status ? `&status=${status}` : ""
      }`;

      const response = await authFetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      posts = data.content || data;
      const totalPages = data.totalPages || 1;

      renderPosts();
      renderPagination(totalPages, currentPage);
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts.");
    }
  }

  function renderPosts() {
    postsList.innerHTML = "";

    if (!posts || posts.length === 0) {
      postsList.innerHTML = `<tr><td colspan="6">No blog posts found</td></tr>`;
      return;
    }

    posts.forEach((post) => {
      const row = document.createElement("tr");
      const postId = post.id || "";

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
          <button class="btn-icon edit-btn" data-id="${postId}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon delete-btn" data-id="${postId}"><i class="fas fa-trash"></i></button>
        </td>
      `;

      postsList.appendChild(row);
    });

    // Bind edit/delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditor(btn.dataset.id));
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => confirmDelete(btn.dataset.id));
    });
  }

  function renderPagination(totalPages, current) {
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    if (current > 1) {
      pagination.appendChild(
        createPaginationButton("Previous", () => {
          currentPage = current - 1;
          loadPosts();
        })
      );
    }

    for (
      let i = Math.max(1, current - 2);
      i <= Math.min(totalPages, current + 2);
      i++
    ) {
      const btn = createPaginationButton(i, () => {
        currentPage = i;
        loadPosts();
      });
      if (i === current) btn.classList.add("active");
      pagination.appendChild(btn);
    }

    if (current < totalPages) {
      pagination.appendChild(
        createPaginationButton("Next", () => {
          currentPage = current + 1;
          loadPosts();
        })
      );
    }
  }

  function openEditor(postId = null) {
    const isEdit = postId !== null;
    document.getElementById("editor-title").textContent = isEdit
      ? "Edit Post"
      : "New Post";

    if (isEdit) {
      const post = posts.find((p) => p.id == postId);
      if (post) {
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
          document.getElementById("publish-date").value = new Date(
            post.publishedAt
          )
            .toISOString()
            .slice(0, 16);
        }

        editor.root.innerHTML = post.content || "";

        if (post.imageUrl) {
          document.getElementById("image-preview").src = post.imageUrl;
          document.getElementById("image-preview").style.display = "block";
        }
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

  function closeEditor() {
    editorModal.style.display = "none";
  }

  async function savePost(event) {
    event.preventDefault();

    const postId = document.getElementById("post-id").value;
    const isEdit = postId !== "";
    const formData = new FormData();

    formData.append("title", document.getElementById("post-title").value);
    formData.append("slug", document.getElementById("post-slug").value);
    formData.append("status", document.getElementById("post-status").value);
    formData.append("snippet", document.getElementById("post-snippet").value);
    formData.append("content", editor.root.innerHTML);
    formData.append(
      "metaDescription",
      document.getElementById("meta-description").value
    );

    const tags = document.getElementById("post-tags").value;
    if (tags) tags.split(",").map((tag) => formData.append("tags", tag.trim()));

    const publishDate = document.getElementById("publish-date").value;
    if (publishDate) {
      formData.append("publishedAt", new Date(publishDate).toISOString());
    }

    const imageFile = document.getElementById("image-upload").files[0];
    if (imageFile) formData.append("image", imageFile);

    const url = isEdit ? `${API_BASE.blogs}/${postId}` : API_BASE.blogs;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await authFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
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
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await authFetch(`${API_BASE.blogs}/${postId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete post");
        loadPosts();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete post.");
      }
    }
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
      placeholder: "Write your blog post...",
    });
  }

  function setupEventListeners() {
    newPostBtn.addEventListener("click", () => openEditor());
    document.querySelector(".close-btn").addEventListener("click", closeEditor);
    document
      .getElementById("cancel-btn")
      .addEventListener("click", closeEditor);
    postForm.addEventListener("submit", savePost);
    statusFilter.addEventListener("change", () => {
      currentPage = 1;
      loadPosts();
    });

    document
      .getElementById("image-upload")
      .addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById("image-preview").src = event.target.result;
            document.getElementById("image-preview").style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      });

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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function showLoading() {
    postsList.innerHTML = `
      <tr><td colspan="6" class="loading">
        <div class="spinner"></div> Loading posts...
      </td></tr>`;
  }

  function showError(msg) {
    postsList.innerHTML = `
      <tr><td colspan="6" class="error">
        <i class="fas fa-exclamation-triangle"></i> ${msg}
      </td></tr>`;
  }
});
