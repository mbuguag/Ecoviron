document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");
  const pagination = document.getElementById("pagination");
  let currentPage = 1;
  const pageSize = 6;

  // Show loading state
  function showLoading() {
    blogGrid.innerHTML = '<div class="loading">Loading blog posts...</div>';
  }

  // Handle errors
  function showError(message) {
    blogGrid.innerHTML = `<div class="error">${message}</div>`;
  }

  // Load blogs with pagination
  function loadBlogs(page) {
    showLoading();

    fetch(`http://localhost:8080/api/blogs/public?page=${page}&size=${pageSize}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        renderBlogs(data.content);
        renderPagination(data.totalPages, page);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        showError("Failed to load blog posts. Please try again later.");
      });
  }

  // Render blog posts
  function renderBlogs(blogs) {
    blogGrid.innerHTML = "";

    if (!blogs || blogs.length === 0) {
      showError("No blog posts found.");
      return;
    }

    blogs.forEach((post) => {
      const card = document.createElement("article"); // More semantic
      card.className = "blog-card";

      // Handle missing image
      const imageUrl = post.imageUrl
        ? resolvePath(post.imageUrl)
        : resolvePath("/uploads/default.jpg");

      // Handle missing alt text
      const altText = post.title || "Blog post image";

      // Handle missing snippet
      const snippet =
        post.snippet || "Click to read more about this article...";

      card.innerHTML = `
        <img src="${imageUrl}" alt="${altText}" loading="lazy" class="blog-thumb" />
        <div class="blog-card-body">
          <h3>${post.title || "Untitled Post"}</h3>
          <p>${snippet}</p>
          <a href="blog-details.html?id=${
            post.id
          }" class="btn-outline">Read More</a>
        </div>
      `;
      blogGrid.appendChild(card);
    });
  }

  // Render pagination controls
  function renderPagination(totalPages, current) {
    pagination.innerHTML = "";

    if (totalPages <= 1) return; // Don't show pagination if only one page

    // Previous button
    if (current > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.innerHTML = "&laquo; Previous";
      prevBtn.addEventListener("click", () => {
        currentPage = current - 1;
        loadBlogs(currentPage);
      });
      pagination.appendChild(prevBtn);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      if (i === current) {
        btn.classList.add("active");
        btn.setAttribute("aria-current", "page");
      }
      btn.addEventListener("click", () => {
        currentPage = i;
        loadBlogs(i);
      });
      pagination.appendChild(btn);
    }

    // Next button
    if (current < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.innerHTML = "Next &raquo;";
      nextBtn.addEventListener("click", () => {
        currentPage = current + 1;
        loadBlogs(currentPage);
      });
      pagination.appendChild(nextBtn);
    }
  }

  // Helper to resolve relative paths
  function resolvePath(path) {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://localhost:8080${path}`;
  }

  // Initial load
  loadBlogs(currentPage);
});
