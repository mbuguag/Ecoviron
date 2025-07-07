// admin-blog.js
const blogForm = document.getElementById("blogForm");
const imageInput = document.getElementById("imageInput");
const statusMsg = document.getElementById("statusMsg");
const blogList = document.getElementById("blogList");
const searchInput = document.getElementById("searchInput");
const blogIdInput = document.createElement("input");
blogIdInput.type = "hidden";
blogIdInput.id = "blogId";
blogForm.appendChild(blogIdInput);

const BASE_URL = "http://localhost:8080/api/blogs";
const IMAGE_UPLOAD_URL = "http://localhost:8080/api/images/blog";

let blogs = [];
let currentPage = 1;
const blogsPerPage = 5;

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusMsg.textContent = "Processing...";

  const id = blogIdInput.value;
  const title = blogForm.title.value.trim();
  const snippet = blogForm.snippet.value.trim();
  const link = blogForm.link.value.trim();
  const file = imageInput.files[0];

  try {
    let imageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(IMAGE_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      imageUrl = await res.text();
    }

    const blogPayload = {
      title,
      snippet,
      link,
      imageUrl: imageUrl || imageInput.dataset.existingUrl || "",
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${BASE_URL}/${id}` : BASE_URL;

    const blogRes = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blogPayload),
    });

    if (!blogRes.ok) throw new Error("Blog submission failed");

    statusMsg.textContent = id ? "Blog updated." : "Blog published.";
    blogForm.reset();
    blogIdInput.value = "";
    imageInput.dataset.existingUrl = "";
    await fetchBlogs();
  } catch (err) {
    statusMsg.textContent = "Error: " + err.message;
    console.error(err);
  }
});

async function fetchBlogs() {
  try {
    const res = await fetch(BASE_URL);
    blogs = await res.json();
    renderBlogs();
  } catch (err) {
    blogList.innerHTML = `<tr><td colspan="4">Failed to load blogs.</td></tr>`;
    console.error("Fetch blogs failed", err);
  }
}

function renderBlogs() {
  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const start = (currentPage - 1) * blogsPerPage;
  const paginated = filtered.slice(start, start + blogsPerPage);

  blogList.innerHTML = paginated
    .map(
      (blog) => `
      <tr>
        <td>${blog.title}</td>
        <td>${blog.snippet}</td>
        <td><img src="${blog.imageUrl}" width="60" height="40" /></td>
        <td>
          <button onclick="editBlog('${blog.id}')" class="btn-outline">Edit</button>
          <button onclick="deleteBlog('${blog.id}')" class="btn-outline danger">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");

  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${Math.ceil(
    filtered.length / blogsPerPage
  )}`;
}

window.editBlog = async (id) => {
  const blog = blogs.find((b) => b.id == id);
  if (!blog) return;

  blogForm.title.value = blog.title;
  blogForm.snippet.value = blog.snippet;
  blogForm.link.value = blog.link;
  blogIdInput.value = blog.id;
  imageInput.dataset.existingUrl = blog.imageUrl;
  statusMsg.textContent = "Editing blog post...";
};

window.deleteBlog = async (id) => {
  if (!confirm("Are you sure you want to delete this blog post?")) return;

  try {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    await fetchBlogs();
  } catch (err) {
    alert("Delete error: " + err.message);
  }
};

searchInput.addEventListener("input", renderBlogs);

// Pagination controls
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderBlogs();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(
    blogs.filter((b) =>
      b.title.toLowerCase().includes(searchInput.value.toLowerCase())
    ).length / blogsPerPage
  );
  if (currentPage < totalPages) {
    currentPage++;
    renderBlogs();
  }
});

// Initial load
fetchBlogs();
