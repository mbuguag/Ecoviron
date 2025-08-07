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

      console.log("Fetching from URL:", url);

      const response = await authFetch(url, {
        method: "GET",
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;
      if (!data) {
        throw new Error("Server returned empty response");
      }

      posts = data.content || data;
      const totalPages = data.totalPages || 1;

      renderPosts();
      renderPagination(totalPages, currentPage);
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts. " + error.message);
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
      const currentStatus = post.status || "DRAFT";

      row.innerHTML = `
        <td>${post.title || "Untitled"}</td>
        <td>${post.author?.fullName || "Unknown"}</td>
        <td>
          <span class="status-badge ${currentStatus.toLowerCase()}">${currentStatus}</span>
        </td>
        <td>${
          post.publishedAt ? formatDate(post.publishedAt) : "Not published"
        }</td>
        <td>${post.viewCount || 0}</td>
        <td class="actions">
          <button class="btn-icon edit-btn" data-id="${postId}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-btn" data-id="${postId}">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn-icon status-toggle-btn" data-id="${postId}" data-status="${currentStatus}">
            <i class="fas fa-toggle-on"></i> ${
              currentStatus === "DRAFT" ? "Publish" : "Unpublish"
            }
          </button>
        </td>
      `;

      postsList.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditor(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => confirmDelete(btn.dataset.id));
    });

    document.querySelectorAll(".status-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        togglePostStatus(btn.dataset.id, btn.dataset.status)
      );
    });
  }

  async function togglePostStatus(postId, currentStatus) {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    try {
      const response = await authFetch(
        `${API_BASE.blogs}/${postId}/status?status=${newStatus}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${errorText}`);
      }

      loadPosts();
    } catch (error) {
      console.error("Status update error:", error);
      showError(`Could not update post status: ${error.message}`);
    }
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
          const fullImageUrl = `${API_BASE.BACKEND_URL}${post.imageUrl}`;
          document.getElementById("image-preview").src = fullImageUrl;
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

    try {
      const postId = document.getElementById("post-id").value;
      const isEdit = postId !== "";
      const formData = new FormData();

      const postData = {
        title: document.getElementById("post-title").value,
        slug: document.getElementById("post-slug").value,
        status: document.getElementById("post-status").value,
        snippet: document.getElementById("post-snippet").value,
        content: editor.root.innerHTML,
        metaDescription: document.getElementById("meta-description").value,
        tags: document
          .getElementById("post-tags")
          .value.split(",")
          .map((tag) => tag.trim()),
        publishedAt: document.getElementById("publish-date").value
          ? new Date(
              document.getElementById("publish-date").value
            ).toISOString()
          : null,
      };

      formData.append(
        "post",
        new Blob([JSON.stringify(postData)], { type: "application/json" }),
        "post.json"
      );

      const imageFile = document.getElementById("image-upload").files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEdit ? `${API_BASE.blogs}/${postId}` : API_BASE.blogs;
      const method = isEdit ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      closeEditor();
      loadPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      showError(`Save failed: ${error.message}`);
    }
  }

  async function confirmDelete(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await authFetch(`${API_BASE.blogs}/${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Delete failed: ${errorText}`);
        }

        loadPosts();
      } catch (error) {
        console.error("Delete error:", error);
        showError(error.message);
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
