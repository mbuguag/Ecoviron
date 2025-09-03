import { API_BASE, authFetch } from "../../";

const postForm = document.getElementById("post-form");
const modal = document.getElementById("editor-modal");
const editorTitle = document.getElementById("editor-title");
const closeBtn = modal.querySelector(".close-btn");
const newPostBtn = document.getElementById("new-post-btn");
const imageUploadInput = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");
const postsList = document.getElementById("posts-list");
const cancelBtn = document.getElementById("cancel-btn");

let quill = new Quill("#post-content-editor", {
  theme: "snow",
});

function openModal(post = null) {
  modal.style.display = "block";
  if (post) {
    editorTitle.textContent = "Edit Blog Post";
    document.getElementById("post-id").value = post.id;
    document.getElementById("post-title").value = post.title;
    document.getElementById("post-slug").value = post.slug;
    document.getElementById("post-status").value = post.status;
    document.getElementById("publish-date").value = post.publishedAt
      ? post.publishedAt.slice(0, 16)
      : "";
    document.getElementById("post-snippet").value = post.snippet;
    document.getElementById("meta-description").value =
      post.metaDescription || "";
    document.getElementById("post-tags").value = post.tags || "";
    document.getElementById("image-preview").src = post.imageUrl || "";
    quill.root.innerHTML = post.content || "";
  } else {
    editorTitle.textContent = "New Blog Post";
    postForm.reset();
    document.getElementById("post-id").value = "";
    quill.root.innerHTML = "";
    imagePreview.src = "";
  }
}

function closeModal() {
  modal.style.display = "none";
}

async function loadPosts() {
  try {
    const posts = await authFetch(API_BASE.blogs);
    postsList.innerHTML = posts
      .map(
        (post) => `
      <tr>
        <td>${post.title}</td>
        <td>${post.author}</td>
        <td>${post.status}</td>
        <td>${
          post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : "-"
        }</td>
        <td>${post.views}</td>
        <td>
          <button class="edit-btn" data-id="${
            post.id
          }"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${
            post.id
          }"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (err) {
    alert("Error loading posts: " + err.message);
  }
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await authFetch(API_BASE.uploadImage, {
    method: "POST",
    body: formData,
  });
  return response.url;
}

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const id = form["id"].value;
  const method = id ? "PUT" : "POST";
  const endpoint = id ? `${API_BASE.blogs}/${id}` : API_BASE.blogs;

  const postData = {
    title: form["title"].value,
    slug: form["slug"].value,
    status: form["status"].value,
    publishedAt: form["publishedAt"].value,
    snippet: form["snippet"].value,
    content: quill.root.innerHTML,
    metaDescription: form["metaDescription"].value,
    tags: form["tags"].value,
  };

  if (imageUploadInput.files[0]) {
    try {
      const imageUrl = await uploadImage(imageUploadInput.files[0]);
      postData.imageUrl = imageUrl;
    } catch (err) {
      alert("Image upload failed: " + err.message);
      return;
    }
  }

  try {
    await authFetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    closeModal();
    loadPosts();
  } catch (err) {
    alert("Error saving post: " + err.message);
  }
});

imageUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
newPostBtn.addEventListener("click", () => openModal());

postsList.addEventListener("click", async (e) => {
  const id = e.target.closest("button")?.dataset.id;
  if (e.target.closest(".edit-btn")) {
    try {
      const post = await authFetch(`${API_BASE.blogs}/${id}`);
      openModal(post);
    } catch (err) {
      alert("Failed to load post: " + err.message);
    }
  } else if (e.target.closest(".delete-btn")) {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await authFetch(`${API_BASE.blogs}/${id}`, { method: "DELETE" });
        loadPosts();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", loadPosts);
