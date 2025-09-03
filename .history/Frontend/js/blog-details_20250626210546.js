document.addEventListener("DOMContentLoaded", () => {
  const blogContainer = document.getElementById("blog-content");
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get("id");

  if (!blogId) {
    blogContainer.innerHTML = "<p>Invalid blog post ID.</p>";
    return;
  }

  fetch(`http://localhost:8080/api/blogs/${blogId}`)
    .then((res) => res.json())
    .then((blog) => {
      const imageUrl = blog.imageUrl
        ? `http://localhost:8080/uploads/${blog.imageUrl}`
        : "../assets/images/default-blog.jpg";

      blogContainer.innerHTML = `
        <article class="blog-post">
          <img src="${imageUrl}" alt="${blog.title}" />
          <h1>${blog.title}</h1>
          <p class="post-meta">Published on ${new Date(
            blog.createdAt
          ).toDateString()}</p>
          <div class="post-body">${blog.content}</div>
        </article>
      `;
    })
    .catch(() => {
      blogContainer.innerHTML =
        "<p>Could not load the blog post. Please try again later.</p>";
    });
});
