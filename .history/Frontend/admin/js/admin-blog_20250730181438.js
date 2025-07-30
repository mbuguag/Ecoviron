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
      const response = await fetch(
        `http://localhost:8080/api/admin-blogs?page=${
          currentPage - 1
        }&size=${pageSize}${status ? `&status=${status}` : ""}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Log the API response
      console.log("API Response:", data);

      // Check if data is in expected format
      if (!data || typeof data !== "object") {
        throw new Error("Invalid API response format");
      }

      // Handle both array and paginated response formats
      if (Array.isArray(data)) {
        // If response is direct array
        posts = data;
        renderPosts();
        renderPagination(1, currentPage); // Single page if no pagination info
      } else if (data.content && Array.isArray(data.content)) {
        // If response is paginated
        posts = data.content;
        const totalPages = data.totalPages || 1;
        renderPosts();
        renderPagination(totalPages, currentPage);
      } else {
        throw new Error("Invalid data structure in response");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts. Please check console for details.");
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

     // Check if post has an ID, otherwise use a temporary or empty value
     const postId = post.id || "";

     row.innerHTML = `
      <td>${post.title || "Untitled"}</td>
      <td>${post.author?.fullName || "Unknown"}</td>
      <td><span class="status-badge ${post.status?.toLowerCase() || "draft"}">${
       post.status || "DRAFT"
     }</span></td>
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
      </td>
    `;

     postsList.appendChild(row);
   });

   // Add event listeners only to buttons that have an ID
   document.querySelectorAll(".edit-btn").forEach((btn) => {
     if (btn.dataset.id) {
       btn.addEventListener("click", () => openEditor(btn.dataset.id));
     } else {
       btn.disabled = true;
       btn.style.opacity = "0.5";
     }
   });

   document.querySelectorAll(".delete-btn").forEach((btn) => {
     if (btn.dataset.id) {
       btn.addEventListener("click", () => confirmDelete(btn.dataset.id));
     } else {
       btn.disabled = true;
       btn.style.opacity = "0.5";
     }
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

  function initEditor() {
    // Initialize Quill editor
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
        document.getElementById("post-status").value = post.status || "DRAFT";
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
          document.getElementById("image-preview").style.display = "block";
        }
      }
    } else {
      // Reset form for new post
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
        ? `http://localhost:8080/api/admin-blogs/${postId}`
        : "http://localhost:8080/api/admin-blogs";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
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
        const response = await fetch(
          `http://localhost:8080/api/blogs/${postId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        loadPosts();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete post. Please try again.");
      }
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
