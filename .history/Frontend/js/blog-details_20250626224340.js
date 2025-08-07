document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  fetch(`http://localhost:8080/api/blogs/${id}`)
    .then((res) => res.json())
    .then((post) => {
      document.getElementById("blog-post").innerHTML = `
        <h1>${post.title}</h1>
        <img src="${post.imageUrl}" alt="${post.title}" />
        <p>${post.content || post.snippet}</p>
      `;
    })
    .catch(() => {
      document.getElementById("blog-post").innerHTML = `<p>Post not found.</p>`;
    });
});
