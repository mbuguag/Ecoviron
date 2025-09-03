export function renderUserDropdown() {
  const authArea = document.getElementById("authArea");
  
  const name = localStorage.getItem("username");
  const photo =
    localStorage.getItem("profileImage") ||
    "/frontend/assets/img/default-avatar.png";

  if (!name) {
    authArea.innerHTML = `<a href="/frontend/login.html">Login</a>`;
    return;
  }

  authArea.innerHTML = `
    <div class="user-dropdown">
      <img class="avatar-small" src="${photo}" alt="${name}" />
      <span>${name.split(" ")[0]}</span>
      <div class="dropdown-content">
        <div class="dropdown-header">My Account</div>
        <a href="/frontend/profile.html">Profile</a>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/login.html";
  });
}
