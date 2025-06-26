document
  .getElementById("blogForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const snippet = document.getElementById("snippet").value;
    const link = document.getElementById("link").value;
    const imageFile = document.getElementById("imageInput").files[0];

    const statusMsg = document.getElementById("statusMsg");

    if (!imageFile) {
      statusMsg.textContent = "Please select an image.";
      return;
    }

    try {
      // Upload image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch(
        "http://localhost:8080/api/uploads/blog-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const imageUrl = await uploadRes.text();

      // Save blog post
      const blogPayload = { title, snippet, link, imageUrl };

      const res = await fetch("http://localhost:8080/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogPayload),
      });

      if (!res.ok) throw new Error("Blog creation failed");

      statusMsg.textContent = "✅ Blog published successfully!";
      statusMsg.style.color = "green";
      e.target.reset();
    } catch (error) {
      statusMsg.textContent = `❌ ${error.message}`;
      statusMsg.style.color = "red";
    }
  });

  async function fetchAndDisplayBlogs() {
    try {
      const res = await fetch("http://localhost:8080/api/blogs");
      const blogs = await res.json();

      const blogList = document.getElementById("blogList");
      blogList.innerHTML = "";

      blogs.forEach((blog, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${blog.title}</td>
        <td>${blog.snippet}</td>
        <td><img src="${blog.imageUrl}" alt="Blog Image" width="80"/></td>
        <td>
          <button class="btn-outline small-btn" onclick="editBlog(${index})">Edit</button>
          <button class="btn-danger small-btn" onclick="deleteBlog(${index})">Delete</button>
        </td>
      `;
        row.dataset.index = index;
        row.dataset.blogId = blog.id || blog._id; // depends on backend
        row.dataset.blogJson = JSON.stringify(blog);
        blogList.appendChild(row);
      });

      // Store for reference
      window.loadedBlogs = blogs;
    } catch (err) {
      console.error("Error loading blogs", err);
    }
  }

  async function deleteBlog(index) {
    const blog = window.loadedBlogs[index];
    if (confirm(`Delete blog: "${blog.title}"?`)) {
      const res = await fetch(`http://localhost:8080/api/blogs/${blog.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAndDisplayBlogs();
      } else {
        alert("Failed to delete blog.");
      }
    }
  }

  function editBlog(index) {
    const blog = window.loadedBlogs[index];
    document.getElementById("title").value = blog.title;
    document.getElementById("snippet").value = blog.snippet;
    document.getElementById("link").value = blog.link;
    document.getElementById("blogForm").dataset.editingId = blog.id;
  }

  document
    .getElementById("blogForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const form = e.target;
      const title = form.title.value;
      const snippet = form.snippet.value;
      const link = form.link.value;
      const imageFile = document.getElementById("imageInput").files[0];
      const editingId = form.dataset.editingId;

      const statusMsg = document.getElementById("statusMsg");

      try {
        let imageUrl = null;

        // Upload new image if selected
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);

          const uploadRes = await fetch(
            "http://localhost:8080/api/uploads/blog-image",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadRes.ok) throw new Error("Image upload failed");
          imageUrl = await uploadRes.text();
        }

        const blogPayload = { title, snippet, link };
        if (imageUrl) blogPayload.imageUrl = imageUrl;

        const method = editingId ? "PUT" : "POST";
        const endpoint = editingId
          ? `http://localhost:8080/api/blogs/${editingId}`
          : "http://localhost:8080/api/blogs";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogPayload),
        });

        if (!res.ok) throw new Error("Saving blog failed");

        statusMsg.textContent = editingId
          ? "✅ Blog updated!"
          : "✅ Blog published!";
        statusMsg.style.color = "green";

        form.reset();
        delete form.dataset.editingId;

        fetchAndDisplayBlogs();
      } catch (err) {
        statusMsg.textContent = `❌ ${err.message}`;
        statusMsg.style.color = "red";
      }
    });

  // Load blogs on page load
  document.addEventListener("DOMContentLoaded", fetchAndDisplayBlogs);
