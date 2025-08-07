import { layoutLoaded } from "./main.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    window.location.href = "blog.html";
    return;
  }

  try {
    // Load post data
    const postResponse = await fetch(
      `http://localhost:8080/api/public-blogs/public/${postId}`
    );

    if (!postResponse.ok) throw new Error("Post not found");

    const post = await postResponse.json();

    // Check if view has already been counted this session
    const viewedKey = `viewed_post_${postId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      try {
        await fetch(
          `http://localhost:8080/api/public-blogs/public/${postId}/views`,
          {
            method: "PUT",
          }
        );
        sessionStorage.setItem(viewedKey, "true");
      } catch (error) {
        console.error("Failed to update view count:", error);
      }
    }

    // Render post
    renderPost(post);

    // Load related posts
    loadRelatedPosts(post.tags, post.id);

    // Set SEO meta tags
    setMetaTags(post);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("blog-post").innerHTML = `
      <div class="error-message">
        <h2>Post Not Found</h2>
        <p>The requested article could not be found.</p>
        <a href="blog.html" class="btn-primary">Back to Blog</a>
      </div>
    `;
  }

  function renderPost(post) {
    // Update page title
    document.title = `${post.title} | BionixEHS Blog`;

    // Set main content
    document.getElementById("post-title").textContent = post.title;
    document.getElementById("post-meta").innerHTML = `
      <div class="author-info">
        <img src="${
          post.author?.profilePicture || "../assets/images/blog"
        }" 
             alt="${post.author?.fullName || "Author"}">
        <div>
          <span class="author-name">${
            post.author?.fullName || "BionixEHS Team"
          }</span>
          <span class="post-date">${formatDate(post.publishedAt)}</span>
        </div>
      </div>
    `;

    document.getElementById("post-content").innerHTML = `
      <div class="featured-image">
        <img src="${post.imageUrl || "../assets/images/blog-default.jpg"}" 
             alt="${post.imageAlt || post.title}">
        ${
          post.imageCaption
            ? `<p class="image-caption">${post.imageCaption}</p>`
            : ""
        }
      </div>
      <div class="post-body">
        ${post.content || "<p>No content available.</p>"}
      </div>
    `;

    document.getElementById("views-counter").textContent = post.viewCount || 0;

    // Render tags
    if (post.tags && post.tags.length > 0) {
      const tagsContainer = document.getElementById("post-tags");
      post.tags.forEach((tag) => {
        const tagEl = document.createElement("a");
        tagEl.href = `blog.html?tag=${encodeURIComponent(tag)}`;
        tagEl.className = "post-tag";
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
    }

    // Set up social sharing
    setupSocialSharing(post);
  }

  async function loadRelatedPosts(tags, excludeId) {
    if (!tags || tags.length === 0) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/blogs/public/related?tags=${tags.join(
          ","
        )}&exclude=${excludeId}&limit=3`
      );

      if (response.ok) {
        const relatedPosts = await response.json();
        renderRelatedPosts(relatedPosts);
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

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";

      card.innerHTML = `
        <div class="card-image">
          <img src="${post.imageUrl || "../images/blog-default.jpg"}" 
               alt="${post.imageAlt || post.title}" 
               loading="lazy">
        </div>
        <div class="card-body">
          <h3>${post.title}</h3>
          <p>${post.snippet || "Read more about this topic..."}</p>
          <a href="blog-details.html?id=${
            post.id
          }" class="btn-outline">Read More</a>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function setMetaTags(post) {
    // Update meta tags for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    if (metaDescription)
      metaDescription.content =
        post.metaDescription || post.snippet || post.title;
    if (ogTitle) ogTitle.content = post.title;
    if (ogDescription)
      ogDescription.content =
        post.metaDescription || post.snippet || post.title;
    if (ogImage)
      ogImage.content =
        post.imageUrl || "https://www.bionix-hse.co.ke/images/og-default.jpg";
    if (twitterTitle) twitterTitle.content = post.title;
    if (twitterDescription)
      twitterDescription.content =
        post.metaDescription || post.snippet || post.title;
    if (twitterImage)
      twitterImage.content =
        post.imageUrl ||
        "https://www.bionix-hse.co.ke/images/twitter-default.jpg";

    // Update structured data
    const ldJson = document.querySelector('script[type="application/ld+json"]');
    if (ldJson) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription || post.snippet,
        author: {
          "@type": "Person",
          name: post.author?.fullName || "BionixEHS Team",
        },
        datePublished: post.publishedAt,
        image:
          post.imageUrl ||
          "https://www.bionix-hse.co.ke/images/schema-default.jpg",
      };
      ldJson.textContent = JSON.stringify(structuredData);
    }
  }

  function setupSocialSharing(post) {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(post.title);
    const shareText = encodeURIComponent(post.snippet || "");
    const shareImage = encodeURIComponent(post.imageUrl || "");

    document
      .querySelector(".share-btn.facebook")
      .addEventListener("click", () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
          "_blank"
        );
      });

    document
      .querySelector(".share-btn.twitter")
      .addEventListener("click", () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
          "_blank"
        );
      });

    document
      .querySelector(".share-btn.linkedin")
      .addEventListener("click", () => {
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareText}`,
          "_blank"
        );
      });
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }
});
