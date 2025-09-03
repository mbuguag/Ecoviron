document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const photo =
    localStorage.getItem("profileImage") || "./assets/icons/default-avatar.png";

  // Populate user summary
  document.getElementById("userName").textContent = name;
  document.getElementById("userEmail").textContent = email;
  document.getElementById("profilePic").src = photo.startsWith("/uploads/")
    ? `http://localhost:8080${photo}`
    : photo;


  // Logout
  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/frontend/index.html";
  });

  const tabContent = document.getElementById("tab-content");
  const tabLinks = document.querySelectorAll(".tab-link");

  const templates = {
    account: (name, email, photo) => `
      <h2>Account Info</h2>
      <form id="accountForm" class="profile-form">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" value="${name}" disabled />
        </div>
        <div class="form-group">
          <label for="userEmail">Email</label>
          <input type="email" id="userEmailField" value="${email}" disabled readonly />
        </div>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input type="password" id="newPassword" name="newPassword" placeholder="Leave blank to keep current" disabled />
        </div>
        <div class="form-group">
          <label for="profileImageUpload">Profile Picture</label>
          <input type="file" id="profileImageUpload" accept="image/*" disabled />
          <img id="previewImage" src="${
            photo.startsWith("/uploads/")
              ? "http://localhost:8080" + photo
              : photo
          }" alt="Preview" class="avatar-preview" />
        </div>
        <div class="form-actions">
          <button type="button" id="editBtn" class="btn">Edit</button>
          <button type="submit" id="saveBtn" class="btn" style="display:none;">Save Changes</button>
        </div>
      </form>
    `,
    orders: async () => {
  const token = localStorage.getItem("jwtToken");
  try {
    const res = await fetch("http://localhost:8080/api/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch orders");

    const orders = await res.json();
    if (orders.length === 0) {
      return `<h2>My Orders</h2><p>No orders yet.</p>`;
    }

    return `
      <h2>My Orders</h2>
      <div class="orders-list">
        ${orders.map(order => `
          <div class="order-card">
            <h4>Order #${order.id}</h4>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
            <p><strong>Total:</strong> KES ${order.total}</p>
            <p><strong>Products:</strong> ${order.productNames.join(", ")}</p>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    return `<p>Error loading orders: ${err.message}</p>`;
  }


    settings: `<h2>Settings</h2><p>Update preferences in future versions.</p>`,
  };

  function loadTab(tab) {
    const content = templates[tab];
    tabContent.innerHTML =
      typeof content === "function" ? content(name, email, photo) : content;
  }

  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(".tab-link.active")?.classList.remove("active");
      link.classList.add("active");
      loadTab(link.dataset.tab);
    });
  });

  loadTab("account");

  // Enable form editing
  document.addEventListener("click", (e) => {
    if (e.target?.id === "editBtn") {
      document
        .querySelectorAll("#accountForm input")
        .forEach((input) => (input.disabled = false));
      document.getElementById("editBtn").style.display = "none";
      document.getElementById("saveBtn").style.display = "inline-block";
    }
  });

  // Save profile changes
  document.addEventListener("submit", async (e) => {
    if (e.target?.id === "accountForm") {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const password = document.getElementById("newPassword").value;
      const profileImage =
        document.getElementById("profileImageUpload").files[0];

      const formData = new FormData();
      formData.append("fullName", fullName);
      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch("http://localhost:8080/api/users/update", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Profile update failed");
        const updated = await res.json();

        localStorage.setItem("username", updated.name);
        if (updated.profileImageUrl)
          localStorage.setItem("profileImage", updated.profileImageUrl);

        alert("Profile updated successfully");
        window.location.reload();
      } catch (err) {
        alert(err.message || "Failed to update profile.");
        console.error(err);
      }
    }
  });

  // Image preview
  document.addEventListener("change", (e) => {
    if (e.target?.id === "profileImageUpload" && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById("previewImage").src = evt.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
});
