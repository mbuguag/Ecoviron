document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");

  fetch("http://localhost:8080/api/blogs")
    .then((response) => response.json())
    .then((blogs) => {
      blogs.forEach((post) => {
        const card = document.createElement("div");
        card.className = "blog-card";
        card.innerHTML = `
          <img src="${resolvePath(post.imageUrl)}" alt="${
          post.title
        }" loading="lazy" />
          <div class="blog-card-body">
            <h3>${post.title}</h3>
            <p>${post.snippet}</p>
            <a href="${post.link}" class="btn-outline">Read More</a>
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
