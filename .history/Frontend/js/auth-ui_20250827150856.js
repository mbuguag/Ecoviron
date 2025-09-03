import { getToken, logout } from "./auth.js";
import { BASE_PATH, API_BASE_URL, resolvePath, getAssetPath } from "../js/apiConfig.js";

export async function renderAuthArea() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const token = getToken();

  if (!token) {
    authArea.innerHTML = `
      <a href="${resolvePath("auth/login.html")}">Login</a>
      <a href="${resolvePath("auth/register.html")}">Register</a>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Token invalid");

    const user = await res.json();
    const name = user.fullName?.split(" ")[0] || "User";
    const photo = user.photoUrl || getAssetPath("assets/img/default-avatar.png");

    authArea.innerHTML = `
  <div class="user-menu">
    <button class="user-trigger">
      <img src="${photo}" alt="${name}" class="avatar">
      <span class="username">${name}</span>
      <i class="fa-solid fa-chevron-down"></i>
    </button>

    <div class="user-dropdown">
      <div class="dropdown-header">My Account</div>
      <a href="${resolvePath("profile.html")}">
        <i class="fa-solid fa-user"></i> Profile
      </a>
      <button id="logoutBtn">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>
  </div>
`;


    // Logout handler
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      logout();
      window.location.href = resolvePath("auth/login.html");
    });

  } catch (err) {
    console.error("Error loading user info:", err);
    authArea.innerHTML = `
      <a href="${resolvePath("auth/login.html")}">Login</a>
      <a href="${resolvePath("auth/register.html")}">Register</a>
    `;
  }
}
