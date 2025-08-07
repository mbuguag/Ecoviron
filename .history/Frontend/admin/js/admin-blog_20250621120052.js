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
