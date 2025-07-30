import { layoutLoaded } from "./main.js";

document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");
  const pagination = document.getElementById("pagination");
  let currentPage = 1;
  const pageSize = 6;

  function showLoading() {
    blogGrid.innerHTML = '<div class="loading">Loading blog posts...</div>';
  }

  function showError(message) {
    blogGrid.innerHTML = `<div class="error">${message}</div>`;
  }

  // Load blogs with pagination
  function loadBlogs(page) {
    showLoading();

    fetch(
      `http://localhost:8080/api/public-blogs/public?page=${
        page - 1
      }&size=${pageSize}`
    )
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

  function renderBlogs(blogs) {
    blogGrid.innerHTML = "";

    if (!blogs || blogs.length === 0) {
      showError("No blog posts found.");
      return;
    }

    blogs.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";

      const imageUrl = post.imageUrl
        ? resolvePath(post.imageUrl)
        : resolvePath("/uploads/default.jpg");

      const altText = post.title || "Blog post image";

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

  // 🔍 Search functionality
  const searchInput = document.getElementById("blog-search");
  const searchBtn = document.getElementById("search-btn");

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      searchBlogs(query, 1);
    } else {
      loadBlogs(1); // reload all
    }
  });

  // Press Enter to search
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // 🔃 Sorting
  const sortOptions = document.getElementById("sort-options");
  sortOptions.addEventListener("change", () => {
    currentPage = 1;
    loadBlogs(currentPage, sortOptions.value);
  });

  // Updated loadBlogs to accept sort param
  function loadBlogs(page, sort = "newest") {
    showLoading();

    const sortParam = getSortParam(sort);
    const url = `http://localhost:8080/api/public-blogs/public?page=${
      page - 1
    }&size=${pageSize}&sort=${sortParam}`;

    fetch(url)
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

  function getSortParam(option) {
    switch (option) {
      case "oldest":
        return "createdAt,asc";
      case "popular":
        return "views,desc";
      case "newest":
      default:
        return "createdAt,desc";
    }
  }

  // 🔍 Blog search API call
  function searchBlogs(query, page = 1) {
    showLoading();

    fetch(
      `http://localhost:8080/api/public-blogs/public/search?query=${encodeURIComponent(
        query
      )}&page=${page - 1}&size=${pageSize}`
    )
      .then((res) => res.json())
      .then((data) => {
        renderBlogs(data.content);
        renderPagination(data.totalPages, page);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        showError("Search failed. Please try again later.");
      });
  }

  function renderPagination(totalPages, current) {
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    if (current > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.innerHTML = "&laquo; Previous";
      prevBtn.addEventListener("click", () => {
        currentPage = current - 1;
        loadBlogs(currentPage);
      });
      pagination.appendChild(prevBtn);
    }

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

  function resolvePath(path) {
    return path?.startsWith("http")
      ? path
      : `http://localhost:8080${path.replace(/^\/?uploads\/?/, "/uploads/")}`;
  }

  loadBlogs(currentPage);
});
