import { layoutLoaded } from "./main.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
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

  // Functions
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
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    blogGrid.innerHTML = "";
    blogGrid.appendChild(errorElement);
  }

  async function loadBlogs(page = 1, sort = currentSort, query = currentQuery) {
    currentPage = page;
    currentSort = sort;
    currentQuery = query;

    showLoading();

    try {
      let url;
      if (query) {
        url = `http://localhost:8080/api/public-blogs/public/search?query=${encodeURIComponent(
          query
        )}&page=${page - 1}&size=${pageSize}&sort=${getSortParam(sort)}`;
      } else {
        url = `http://localhost:8080/api/public-blogs/public?page=${
          page - 1
        }&size=${pageSize}&sort=${getSortParam(sort)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      renderBlogs(data.content);
      renderPagination(data.totalPages, page);
    } catch (error) {
      console.error("Error fetching blogs:", error);
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
      const snippet =
        post.snippet || "Click to read more about this article...";
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
            <a href="blog-details.html?id=${
              post.id
            }" class="btn-outline">Read More</a>
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

    // Previous Button
    if (current > 1) {
      const prevBtn = createPaginationButton("&laquo; Previous", () => {
        loadBlogs(current - 1);
      });
      prevBtn.classList.add("prev-btn");
      pagination.appendChild(prevBtn);
    }

    // Page Numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      const firstBtn = createPaginationButton("1", () => loadBlogs(1));
      pagination.appendChild(firstBtn);
      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "ellipsis";
        ellipsis.textContent = "...";
        pagination.appendChild(ellipsis);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = createPaginationButton(i.toString(), () => loadBlogs(i));
      if (i === current) {
        btn.classList.add("active");
        btn.setAttribute("aria-current", "page");
      }
      pagination.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "ellipsis";
        ellipsis.textContent = "...";
        pagination.appendChild(ellipsis);
      }
      const lastBtn = createPaginationButton(totalPages.toString(), () =>
        loadBlogs(totalPages)
      );
      pagination.appendChild(lastBtn);
    }

    // Next Button
    if (current < totalPages) {
      const nextBtn = createPaginationButton("Next &raquo;", () => {
        loadBlogs(current + 1);
      });
      nextBtn.classList.add("next-btn");
      pagination.appendChild(nextBtn);
    }
  }

  function createPaginationButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.innerHTML = text;
    btn.addEventListener("click", onClick);
    return btn;
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
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch {
      return "";
    }
  }

  function resolvePath(path) {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `http://localhost:8080${path.startsWith("/") ? "" : "/"}${path}`;
  }

  // Event Listeners
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    currentQuery = query;
    loadBlogs(1);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  sortOptions.addEventListener("change", (e) => {
    currentSort = e.target.value;
    loadBlogs(1);
  });

  // Expose for debugging
  window.blogApp = {
    reload: () => loadBlogs(currentPage),
    getState: () => ({
      currentPage,
      currentQuery,
      currentSort,
    }),
  };
});
