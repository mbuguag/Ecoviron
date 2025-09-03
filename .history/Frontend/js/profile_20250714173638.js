document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const photo =
    localStorage.getItem("profileImage") || "./assets/icons/default-avatar.png";

  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const firstNameEl = document.getElementById("firstName");
  const picEl = document.getElementById("profilePic");

  if (nameEl) nameEl.textContent = name;
  if (firstNameEl) firstNameEl.textContent = name.split(" ")[0];
  if (emailEl) emailEl.textContent = email;
  if (picEl) picEl.src = photo;

  // Logout logic
  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/frontend/auth/login.html";
  });

  // Tab switching logic
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContent = document.getElementById("tab-content");

  const tabTemplates = {
    account: `
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
      <img id="previewImage" src="${photo}" alt="Preview" class="avatar-preview" />
    </div>

    <div class="form-actions">
      <button type="button" id="editBtn" class="btn">Edit</button>
      <button type="submit" id="saveBtn" class="btn" style="display:none;">Save Changes</button>
    </div>
  </form>
`,

    orders: `
      <h2>My Orders</h2>
      <p>Order history will be displayed here.</p>
    `,
    settings: `
      <h2>Settings</h2>
      <p>Here you can update your preferences in future versions.</p>
    `,
  };

  function loadTab(tab) {
    tabContent.innerHTML = tabTemplates[tab] || "<p>Unknown tab</p>";
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
  // Load default tab
});
