export function renderAuthArea() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const token = localStorage.getItem("jwtToken");
  const userName = localStorage.getItem("userName");
  const profilePic = localStorage.getItem("profilePic");

  authArea.innerHTML = token
    ? `
    <div class="user-info">
      <img src="${
        profilePic || "/frontend/assets/icons/user-default.jpg"
      }" alt="User" class="user-avatar">
      <span class="user-name">${userName || "User"}</span>
      <a href="/frontend/auth/logout.html" class="logout-btn">Logout</a>
    </div>`
    : `<a href="/frontend/auth/login.html" class="login-btn">Login</a>`;
}
