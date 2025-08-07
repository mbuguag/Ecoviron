import { layoutLoaded } from "./main.js";
document.addEventListener('DOMContentLoaded', async () => {
  const postId = getPostIdFromUrl();
  if (!postId) {
    console.error("No post ID found in URL.");
    return;
  }

  try {
    const post = await fetchPost(postId);
    if (!post) return;

    await incrementViews(postId);
    renderPost(post);
    setupSocialSharing(post);
  } catch (error) {
    console.error("Error loading blog post:", error);
  }
});

function getPostIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function fetchPost(id) {
  try {
    const response = await fetch(`/api/blog/public/${id}`);
    if (!response.ok) throw new Error('Failed to fetch blog post');

    const post = await response.json();
    return post;
  } catch (err) {
    console.error("Fetch post error:", err);
    return null;
  }
}

async function incrementViews(id) {
  try {
    const response = await fetch(`/api/blog/public/${id}/views`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 204) {
      console.warn(`Unexpected response for view increment: ${response.status}`);
    }
  } catch (err) {
    console.error("View count increment failed:", err);
  }
}

function renderPost(post) {
  const container = document.getElementById('blog-content');
  if (!container) return;

  container.innerHTML = `
    <div class="blog-post">
      <h1 class="blog-title">${post.title}</h1>
      <div class="blog-meta mb-3 text-muted">
        <span>By <strong>${post.authorName || 'Unknown'}</strong></span> |
        <span>${new Date(post.createdAt).toLocaleDateString()}</span> |
        <span><i class="fas fa-eye"></i> ${post.viewCount || 0}</span>
      </div>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="img-fluid mb-4" alt="Blog Image">` : ''}
      <div class="blog-content">${post.content}</div>
      <div class="social-share mt-4">
        <p>Share this post:</p>
        <div id="share-links" class="d-flex gap-2 flex-wrap"></div>
      </div>
    </div>
  `;
}

function setupSocialSharing(post) {
  const shareLinks = document.getElementById('share-links');
  if (!shareLinks) return;

  const url = window.location.href;
  const text = encodeURIComponent(post.title);

  const platforms = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      icon: "fab fa-facebook"
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      icon: "fab fa-twitter"
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
      icon: "fab fa-linkedin"
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      icon: "fab fa-whatsapp"
    }
  ];

  platforms.forEach(platform => {
    const a = document.createElement('a');
    a.href = platform.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "btn btn-outline-primary btn-sm";
    a.innerHTML = `<i class="${platform.icon} me-1"></i> ${platform.name}`;
    shareLinks.appendChild(a);
  });
}
