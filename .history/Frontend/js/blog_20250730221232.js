document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("blog-search");
  const searchBtn = document.getElementById("search-btn");
  const sortSelect = document.getElementById("sort-options");
  const tagFilters = document.getElementById("popular-tags");

  let currentPage = 1;
  const pageSize = 9;
  let currentQuery = "";
  let currentSort = "newest";
  let currentTag = "";

  // Initialize
  loadPopularTags();
  loadBlogs();

  // Event Listeners
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });

  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    loadBlogs();
  });

  // Functions
  function performSearch() {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    loadBlogs();
  }

  async function loadPopularTags() {
    try {
      const response = await fetch(
        "http://localhost:8080/api/public-blogs/tags"
      );
      const tags = await response.json();

      tags.forEach((tag) => {
        const tagEl = document.createElement("button");
        tagEl.className = "tag-filter";
        tagEl.textContent = tag;
        tagEl.addEventListener("click", () => {
          currentTag = tag;
          currentPage = 1;
          loadBlogs();
        });
        tagFilters.appendChild(tagEl);
      });
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }

  async function loadBlogs() {
    showLoading();

    try {
      let url = `http://localhost:8080/api/public-blogs?page=${
        currentPage - 1
      }&size=${pageSize}`;

      if (currentQuery) {
        url += `&query=${encodeURIComponent(currentQuery)}`;
      }

      if (currentTag) {
        url += `&tag=${encodeURIComponent(currentTag)}`;
      }

      url += `&sort=${currentSort}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      renderBlogs(data.content);
      renderPagination(data.totalPages, currentPage);
    } catch (error) {
      showError("Failed to load blog posts. Please try again later.");
      console.error("Error:", error);
    }
  }

  function renderBlogs(posts) {
    blogGrid.innerHTML = "";

    if (!posts || posts.length === 0) {
      showError("No blog posts found.");
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";

      card.innerHTML = `
        <div class="card-image">
          <img src="${post.imageUrl || "../images/blog-default.jpg"}" 
               alt="${post.imageAlt || post.title}" 
               loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="post-date">${formatDate(post.publishedAt)}</span>
            <span class="post-views"><i class="fas fa-eye"></i> ${
              post.viewCount || 0
            }</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.snippet || "Read more about this topic..."}</p>
          <a href="blog-details.html?id=${
            post.id
          }" class="btn-outline">Read More</a>
        </div>
      `;

      blogGrid.appendChild(card);
    });
  }

  function renderPagination(totalPages, current) {
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous button
    if (current > 1) {
      const prevBtn = createPaginationButton("&laquo; Previous", () => {
        currentPage = current - 1;
        loadBlogs();
      });
      pagination.appendChild(prevBtn);
    }

    // Page numbers
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      const btn = createPaginationButton(i, () => {
        currentPage = i;
        loadBlogs();
      });
      if (i === current) {
        btn.classList.add("active");
      }
      pagination.appendChild(btn);
    }

    // Next button
    if (current < totalPages) {
      const nextBtn = createPaginationButton("Next &raquo;", () => {
        currentPage = current + 1;
        loadBlogs();
      });
      pagination.appendChild(nextBtn);
    }
  }

  function createPaginationButton(text, onClick) {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  function showLoading() {
    blogGrid.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>
    `;
  }

  function showError(message) {
    blogGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
      </div>
    `;
  }
});
