import { getToken, logout } from "./auth.js";
import { BASE_PATH, API_BASE_URL, resolvePath, getAssetPath } from "../js/apiConfig.js";

export async function renderAuthArea(containerId = "authArea") {
  const authArea = document.getElementById(containerId);
  if (!authArea) return;

  const token = getToken();

  // Not logged in → show dropdown with Login/Register
  if (!token) {
    authArea.innerHTML = `
      <li class="dropdown header-auth-item">
        <a href="#" class="header-nav-link">Account ▾</a>
        <div class="dropdown-content">
          <a href="${resolvePath("auth/login.html")}">Login</a>
          <a href="${resolvePath("auth/register.html")}">Register</a>
        </div>
      </li>
    `;
    return;
  }

  // Logged in → fetch user
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Invalid token");
    const user = await res.json();

    const name = user.fullName?.split(" ")[0] || "User";
    const photo = user.photoUrl || getAssetPath("assets/img/default-avatar.png");

    authArea.innerHTML = `
      <li class="dropdown user-dropdown">
        <a href="#" class="header-nav-link user-trigger">
          <img src="${photo}" alt="${name}" class="avatar-small">
          <span class="username">${name}</span>
        </a>
        <div class="dropdown-content">
          <div class="dropdown-header">My Account</div>
          <a href="${resolvePath("profile.html")}"><i class="fa-solid fa-user"></i> Profile</a>
          <button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        </div>
      </li>
    `;

    // Bind logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      logout();
      window.location.href = resolvePath("auth/login.html");
    });

  } catch (err) {
    console.error("Auth render error:", err);
    authArea.innerHTML = `
      <li><a href="${resolvePath("auth/login.html")}" class="header-nav-link">Login</a></li>
    `;
  }
}
