import { fetchBlogs } from "./blogApi.js";
import { STATIC_BASE_URL } from "./apiConfig.js";

document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("blog-search");
  const searchBtn = document.getElementById("search-btn");
  const sortOptions = document.getElementById("sort-options");
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";

  // State
  let currentPage = 1;
  const pageSize = 6;
  let currentQuery = "";
  let currentSort = "newest";

  // Initialize
  initLoadingIndicator();
  loadBlogs();

  function initLoadingIndicator() {
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <p>Loading posts...</p>
    `;
    blogGrid.appendChild(loadingIndicator);
  }

  function showLoading() {
    loadingIndicator.style.display = "flex";
    blogGrid.style.opacity = "0.5";
  }

  function hideLoading() {
    loadingIndicator.style.display = "none";
    blogGrid.style.opacity = "1";
  }

  function showError(message) {
    blogGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      </div>
    `;
  }

  async function loadBlogs(page = 1, sort = currentSort, query = currentQuery) {
    currentPage = page;
    currentSort = sort;
    currentQuery = query;

    showLoading();
    try {
      const data = await fetchBlogs({
        page: page - 1,
        size: pageSize,
        sort: getSortParam(sort),
        query: query,
      });

      renderBlogs(data.content);
      renderPagination(data.totalPages, page);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      showError("Failed to load blog posts. Please try again later.");
    } finally {
      hideLoading();
    }
  }

  function renderBlogs(blogs) {
    blogGrid.innerHTML = "";

    if (!blogs || blogs.length === 0) {
      showError("No blog posts found matching your criteria.");
      return;
    }

    blogs.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.setAttribute("data-id", post.id);

      const imageUrl = post.imageUrl
        ? resolvePath(post.imageUrl)
        : resolvePath("/uploads/default.jpg");

      const altText = post.title || "Blog post image";
      const snippet = post.snippet || "Click to read more about this article...";
      const date = post.publishedAt ? formatDate(post.publishedAt) : "";

      card.innerHTML = `
        <div class="blog-card-image">
          <img src="${imageUrl}" alt="${altText}" loading="lazy" class="blog-thumb" />
          ${date ? `<time datetime="${post.publishedAt}">${date}</time>` : ""}
        </div>
        <div class="blog-card-body">
          <h3>${post.title || "Untitled Post"}</h3>
          <p>${snippet}</p>
          <div class="blog-card-footer">
            <a href="blog-details.html?id=${post.id}" class="btn-outline">Read More</a>
            ${
              post.viewCount
                ? `<span class="views"><i class="fas fa-eye"></i> ${post.viewCount}</span>`
                : ""
            }
          </div>
        </div>
      `;

      blogGrid.appendChild(card);
    });
  }

  function renderPagination(totalPages, current) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    // Prev
    if (current > 1) {
      pagination.appendChild(createPaginationButton("&laquo; Previous", () => loadBlogs(current - 1)));
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pagination.appendChild(createPaginationButton("1", () => loadBlogs(1)));
      if (startPage > 2) pagination.appendChild(createEllipsis());
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = createPaginationButton(i.toString(), () => loadBlogs(i));
      if (i === current) btn.classList.add("active");
      pagination.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pagination.appendChild(createEllipsis());
      pagination.appendChild(createPaginationButton(totalPages.toString(), () => loadBlogs(totalPages)));
    }

    // Next
    if (current < totalPages) {
      pagination.appendChild(createPaginationButton("Next &raquo;", () => loadBlogs(current + 1)));
    }
  }

  function createPaginationButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.innerHTML = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function createEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.className = "ellipsis";
    ellipsis.textContent = "...";
    return ellipsis;
  }

  function getSortParam(option) {
    const sortOptions = {
      newest: "publishedAt,desc",
      oldest: "publishedAt,asc",
      popular: "viewCount,desc",
      "title-asc": "title,asc",
      "title-desc": "title,desc",
    };
    return sortOptions[option] || "publishedAt,desc";
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }

  function resolvePath(path) {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `${STATIC_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  // Events
  searchBtn.addEventListener("click", () => loadBlogs(1, currentSort, searchInput.value.trim()));
  searchInput.addEventListener("keydown", (e) => e.key === "Enter" && searchBtn.click());
  sortOptions.addEventListener("change", (e) => loadBlogs(1, e.target.value, currentQuery));

  // Debugging
  window.blogApp = {
    reload: () => loadBlogs(currentPage),
    getState: () => ({ currentPage, currentQuery, currentSort }),
  };
});