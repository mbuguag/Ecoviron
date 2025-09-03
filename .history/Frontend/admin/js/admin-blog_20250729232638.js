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
  let editor; // Will hold the rich text editor instance

  // Initialize
  loadPosts();
  initEditor();
  setupEventListeners();

async function loadPosts() {
  try {
    const status = statusFilter.value !== "all" ? statusFilter.value : null;
    const response = await fetch(
      `http://localhost:8080/api/blogs?page=${
        currentPage - 1
      }&size=${pageSize}${status ? `&status=${status}` : ""}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure data.content exists and is an array
    if (!data.content || !Array.isArray(data.content)) {
      throw new Error("Invalid data format received");
    }

    posts = data.content;
    renderPosts();
    renderPagination(data.totalPages, currentPage);
  } catch (error) {
    console.error("Error:", error);
    postsList.innerHTML =
      '<tr><td colspan="6">Failed to load posts. Please try again.</td></tr>';
  }
}

  function renderPosts() {
    postsList.innerHTML = "";

    if (posts.length === 0) {
      postsList.innerHTML = '<tr><td colspan="6">No posts found</td></tr>';
      return;
    }

    posts.forEach((post) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${post.title || "Untitled"}</td>
        <td>${post.author?.fullName || "Unknown"}</td>
        <td><span class="status-badge ${post.status.toLowerCase()}">${
        post.status
      }</span></td>
        <td>${
          post.publishedAt ? formatDate(post.publishedAt) : "Not published"
        }</td>
        <td>${post.viewCount || 0}</td>
        <td class="actions">
          <button class="btn-icon edit-btn" data-id="${post.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-btn" data-id="${post.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

      postsList.appendChild(row);
    });

    // Add event listeners to action buttons
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

    // Previous button
    if (current > 1) {
      const prevBtn = createPaginationButton("Previous", () => {
        currentPage = current - 1;
        loadPosts();
      });
      pagination.appendChild(prevBtn);
    }

    // Page numbers
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      const btn = createPaginationButton(i, () => {
        currentPage = i;
        loadPosts();
      });
      if (i === current) {
        btn.classList.add("active");
      }
      pagination.appendChild(btn);
    }

    // Next button
    if (current < totalPages) {
      const nextBtn = createPaginationButton("Next", () => {
        currentPage = current + 1;
        loadPosts();
      });
      pagination.appendChild(nextBtn);
    }
  }

  function createPaginationButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function initEditor() {
    // Initialize rich text editor (using Quill as example)
    editor = new Quill("#post-content-editor", {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      theme: "snow",
    });
  }

  function openEditor(postId = null) {
    const isEdit = postId !== null;
    document.getElementById("editor-title").textContent = isEdit
      ? "Edit Post"
      : "New Post";

    if (isEdit) {
      // Load post data
      const post = posts.find((p) => p.id == postId);
      if (post) {
        document.getElementById("post-id").value = post.id;
        document.getElementById("post-title").value = post.title;
        document.getElementById("post-slug").value = post.slug;
        document.getElementById("post-status").value = post.status;
        document.getElementById("post-snippet").value = post.snippet;
        document.getElementById("meta-description").value =
          post.metaDescription || "";
        document.getElementById("post-tags").value =
          post.tags?.join(", ") || "";

        if (post.publishedAt) {
          const date = new Date(post.publishedAt);
          const formattedDate = date.toISOString().slice(0, 16);
          document.getElementById("publish-date").value = formattedDate;
        }

        editor.root.innerHTML = post.content || "";

        if (post.imageUrl) {
          document.getElementById("image-preview").src = post.imageUrl;
        }
      }
    } else {
      // Reset form for new post
      postForm.reset();
      editor.root.innerHTML = "";
      document.getElementById("image-preview").src = "";
      document.getElementById("post-id").value = "";
    }

    editorModal.style.display = "block";
  }

  function closeEditor() {
    editorModal.style.display = "none";
  }

  function savePost(event) {
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

    const url = isEdit
      ? `http://localhost:8080/api/blogs/${postId}`
      : "http://localhost:8080/api/blogs";

    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method: method,
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then(() => {
        closeEditor();
        loadPosts();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to save post. Please try again.");
      });
  }

  function confirmDelete(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
      fetch(`http://localhost:8080/api/blogs/${postId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText);
          loadPosts();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to delete post.");
        });
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

  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }
});
