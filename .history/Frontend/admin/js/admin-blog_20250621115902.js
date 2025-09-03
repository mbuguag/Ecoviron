document
  .getElementById("blogForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const title = form.title.value;
    const snippet = form.snippet.value;
    const link = form.link.value;
    const imageFile = document.getElementById("imageInput").files[0];

    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    const imageData = new FormData();
    imageData.append("file", imageFile);

    try {
      // Upload image first
      const uploadRes = await fetch(
        "http://localhost:8080/api/uploads/blog-image",
        {
          method: "POST",
          body: imageData,
        }
      );
      const imageUrl = await uploadRes.text();

      // Now post blog data
      const blogPayload = { title, snippet, link, imageUrl };
      const response = await fetch("http://localhost:8080/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogPayload),
      });

      if (response.ok) {
        document.getElementById("statusMsg").textContent =
          "Blog post published!";
        form.reset();
      } else {
        throw new Error("Failed to publish blog.");
      }
    } catch (error) {
      document.getElementById("statusMsg").textContent =
        "Error: " + error.message;
    }
  });
