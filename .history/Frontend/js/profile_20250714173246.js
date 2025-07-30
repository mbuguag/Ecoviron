document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const photo =
    localStorage.getItem("profileImage") || "../assets/icons/default-avatar.png";

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
      <p><strong>Full Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${
        localStorage.getItem("userRole") || "Customer"
      }</p>
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

  loadTab("account"); // Load default tab
});
