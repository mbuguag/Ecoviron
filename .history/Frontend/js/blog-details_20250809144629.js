document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    window.location.href = "blog.html";
    return;
  }

  try {
    const viewedKey = `viewed_post_${postId}`;

    // First fetch the post
    let post = await fetchPost(postId);

    // Update view count once per session
    if (!sessionStorage.getItem(viewedKey)) {
      await incrementViewCount(postId);
      post = await fetchPost(postId);
      sessionStorage.setItem(viewedKey, "true");
    }

    renderPost(post);
    loadRelatedPosts(post.tags, post.id);
    setMetaTags(post);
  } catch (error) {
    console.error("Error loading post:", error);
    document.getElementById("post-content").innerHTML = `
      <div class="error-message">
        <h2>Post Not Found</h2>
        <p>The requested article could not be found.</p>
        <a href="blog.html" class="btn-primary">Back to Blog</a>
      </div>
    `;
  }
});

async function fetchPost(postId) {
  const response = await fetch(`http://localhost:8080/api/public-blogs/public/${postId}`);
  if (!response.ok) throw new Error("Post not found");
  return await response.json();
}

async function incrementViewCount(postId) {
  try {
    const response = await fetch(`http://localhost:8080/api/public-blogs/public/${postId}/views`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error("Failed to increment view count");
  } catch (err) {
    console.warn("View count error:", err);
  }
}

function renderPost(post) {
  // Update page title
  document.title = `${post.title} | BionixEHS Blog`;

  // Meta section
  const metaHTML = `
    <div class="author-info">
      <img src="${post.author?.profilePicture || "../assets/images/blog.jpg"}" alt="${post.author?.fullName || "Author"}">
      <div>
        <span class="author-name">${post.author?.fullName || "BionixEHS Team"}</span>
        <span class="post-date">${formatDate(post.publishedAt)}</span>
      </div>
    </div>
  `;
  document.getElementById("post-meta").innerHTML = metaHTML;

  // Main content
  const contentHTML = `
    <div class="featured-image">
      <img src="${post.imageUrl || "../assets/images/blog.jpg"}" alt="${post.imageAlt || post.title}">
      ${post.imageCaption ? `<p class="image-caption">${post.imageCaption}</p>` : ""}
    </div>
    <div class="post-body">
      ${post.content || "<p>No content available.</p>"}
    </div>
  `;
  document.getElementById("post-content").innerHTML = contentHTML;

  // View count
  document.getElementById("views-counter").textContent = `${post.viewCount || 0} views`;document.getElementById("views-counter").textContent = `${post.viewCount || 0} views`;

  // Tags
  const tagsContainer = document.getElementById("post-tags");
  if (post.tags?.length > 0 && tagsContainer) {
    post.tags.forEach(tag => {
      const tagEl = document.createElement("a");
      tagEl.href = `blog.html?tag=${encodeURIComponent(tag)}`;
      tagEl.className = "post-tag";
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
  }

  // Sharing
  setupSocialSharing(post);
}

async function loadRelatedPosts(tags, excludeId) {
  if (!tags || tags.length === 0) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/blogs/public/related?tags=${tags.join(",")}&exclude=${excludeId}&limit=3`
    );
    if (response.ok) {
      const posts = await response.json();
      renderRelatedPosts(posts);
    }
  } catch (error) {
    console.error("Error loading related posts:", error);
  }
}

function renderRelatedPosts(posts) {
  const container = document.getElementById("related-posts");
  if (!posts || posts.length === 0) {
    container.innerHTML = "<p>No related articles found.</p>";
    return;
  }

  posts.forEach(post => {
    const card = document.createElement("article");
    card.className = "blog-card";
    card.innerHTML = `
      <div class="card-image">
        <img src="${post.imageUrl || "../images/blog-default.jpg"}" alt="${post.imageAlt || post.title}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${post.title}</h3>
        <p>${post.snippet || "Read more about this topic..."}</p>
        <a href="blog-details.html?id=${post.id}" class="btn-outline">Read More</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupSocialSharing(post) {
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);
  const shareText = encodeURIComponent(post.snippet || "");
  const shareImage = encodeURIComponent(post.imageUrl || "https://www.bionixehs.com/images/og-default.jpg");

  // Facebook
  document.querySelector(".share-btn.facebook")?.addEventListener("click", () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&picture=${shareImage}&title=${shareTitle}&description=${shareText}`, "_blank", "width=600,height=400");
  });

  // Twitter
  document.querySelector(".share-btn.twitter")?.addEventListener("click", () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}&hashtags=BionixEHS`, "_blank", "width=600,height=400");
  });

  // LinkedIn
  document.querySelector(".share-btn.linkedin")?.addEventListener("click", () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareText}&source=BionixEHS`, "_blank", "width=600,height=400");
  });

  // Add click event for native share API if available
  if (navigator.share) {
    const nativeShareBtn = document.createElement('button');
    nativeShareBtn.className = 'share-btn share-native';
    nativeShareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    nativeShareBtn.setAttribute('aria-label', 'Share');
    document.querySelector('.social-share').appendChild(nativeShareBtn);
    
    nativeShareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: post.title,
          text: post.snippet || "",
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    });
  }
}

function setMetaTags(post) {
  const setContent = (selector, content) => {
    const el = document.querySelector(selector);
    if (el) el.content = content;
  };

  const title = post.title;
  const description = post.metaDescription || post.snippet || post.title;
  const imageUrl = post.imageUrl || "https://www.bionix-hse.co.ke/images/og-default.jpg";

  setContent('meta[name="description"]', description);
  setContent('meta[property="og:title"]', title);
  setContent('meta[property="og:description"]', description);
  setContent('meta[property="og:image"]', imageUrl);
  setContent('meta[property="og:url"]', window.location.href);
  setContent('meta[name="twitter:title"]', title);
  setContent('meta[name="twitter:description"]', description);
  setContent('meta[name="twitter:image"]', imageUrl);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}
