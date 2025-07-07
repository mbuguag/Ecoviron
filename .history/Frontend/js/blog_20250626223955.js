document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");

  fetch("http://localhost:8080/api/blogs")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch blogs");
      return response.json();
    })
    .then((blogs) => {
      blogs.forEach((post) => {
        const card = document.createElement("div");
        card.className = "blog-card";

        const imageUrl = resolvePath(post.imageUrl || "/uploads/default.jpg");
        const linkUrl = post.link && post.link.trim() !== "" ? post.link : "#";

        card.innerHTML = `
          <img src="${imageUrl}" alt="${post.title}" loading="lazy" class="blog-thumb" />
          <div class="blog-card-body">
            <h3>${post.title}</h3>
            <p>${post.snippet}</p>
            <a href="${linkUrl}" class="btn-outline">Read More</a>
          </div>
        `;

        blogGrid.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching blogs:", error);
      blogGrid.innerHTML =
        "<p>Failed to load blog posts. Please try again later.</p>";
    });
});

// Helper to resolve relative paths
function resolvePath(path) {
  return path.startsWith("http") ? path : `http://localhost:8080${path}`;
}

let currentPage = 1;
const pageSize = 6;

document.addEventListener("DOMContentLoaded", () => {
  loadBlogs(currentPage);
});

function loadBlogs(page) {
  fetch(`http://localhost:8080/api/blogs?page=${page}&size=${pageSize}`)
    .then((res) => res.json())
    .then((data) => {
      renderBlogs(data.content);
      renderPagination(data.totalPages, page);
    })
    .catch((err) => console.error("Error fetching blogs:", err));
}

function renderBlogs(blogs) {
  const blogGrid = document.getElementById("blog-grid");
  blogGrid.innerHTML = "";
  blogs.forEach((post) => {
    const card = document.createElement("div");
    card.className = "blog-card";
    card.innerHTML = `
      <img src="${post.imageUrl}" alt="${post.title}" />
      <div class="blog-card-body">
        <h3>${post.title}</h3>
        <p>${post.snippet}</p>
        <a href="blog-details.html?id=${post.id}" class="btn-outline">Read More</a>
      </div>
    `;
    blogGrid.appendChild(card);
  });
}

function renderPagination(totalPages, current) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      loadBlogs(i);
    };
    pagination.appendChild(btn);
  }
}
