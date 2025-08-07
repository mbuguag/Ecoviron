document.addEventListener("DOMContentLoaded", () => {
  const postId = getPostIdFromURL();
  if (!postId) {
    showError("No blog post ID provided.");
    return;
  }

  incrementViewCount(postId);
  fetchAndRenderPost(postId);
});

// Helper to get post ID from URL query string (e.g., ?id=1)
function getPostIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Sends PUT request to increment the view count
function incrementViewCount(postId) {
  fetch(`http://localhost:8080/api/blog/public/${postId}/views`, {
    method: "PUT",
  }).catch((err) => {
    console.warn("Failed to increment view count:", err);
  });
}

// Fetches blog post data and renders it
function fetchAndRenderPost(postId) {
  fetch(`http://localhost:8080/api/blog/public/${postId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Blog post not found");
      return response.json();
    })
    .then((post) => renderPost(post))
    .catch((error) => {
      console.error("Error:", error);
      showError("Blog post could not be loaded.");
    });
}

// Renders blog content to DOM
function renderPost(post) {
  const titleEl = document.getElementById("post-title");
  const authorEl = document.getElementById("post-author");
  const dateEl = document.getElementById("post-date");
  const contentEl = document.getElementById("post-content");
  const imageEl = document.getElementById("post-image");
  const viewCountEl = document.getElementById("post-views");

  if (!titleEl || !authorEl || !dateEl || !contentEl || !imageEl || !viewCountEl) {
    console.error("Some elements are missing in the HTML");
    return;
  }

  titleEl.textContent = post.title;
  authorEl.textContent = post.author?.fullName || "Unknown Author";
  dateEl.textContent = new Date(post.createdAt).toLocaleDateString();
  contentEl.innerHTML = post.content;
  viewCountEl.textContent = post.viewCount ?? 0;

  if (post.image) {
    imageEl.src = `http://localhost:8080/api/files/${post.image}`;
    imageEl.alt = post.title;
  } else {
    imageEl.style.display = "none";
  }
}

// Display error message on page
function showError(message) {
  const contentEl = document.getElementById("post-content");
  if (contentEl) {
    contentEl.innerHTML = `<p style="color: red;">${message}</p>`;
  }
}
