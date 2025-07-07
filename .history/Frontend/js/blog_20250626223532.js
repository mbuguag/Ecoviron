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
