export function renderUserDropdown() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const name = localStorage.getItem("username");

  if (!name) {
    authArea.innerHTML = `<a href="/frontend/auth/login.html">Login</a>`;
    return;
  }

  authArea.innerHTML = `
    <div class="user-dropdown">
      <a href="#" class="header-nav-link">
        <i class="fas fa-user"></i> ${name.split(" ")[0]}
      </a>
      <div class="dropdown-content">
        <div class="dropdown-header">My Account</div>
        <a href="/frontend/profile.html">Profile</a>
        <a href="#" id="logoutBtn">Logout</a>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/frontend/index.html";
  });
}
