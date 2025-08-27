import { getToken, logout } from "./auth.js";
import { API_BASE_URL, resolvePath, getAssetPath } from "../js/apiConfig.js";

export async function renderAuthArea(containerId = "authArea") {
  const authArea = document.getElementById(containerId);
  if (!authArea) return;

  const token = getToken();

  // 🚪 Not logged in → show Login / Register buttons
  if (!token) {
    authArea.innerHTML = `
      <div class="auth-links">
        <a href="${resolvePath("auth/login.html")}" class="auth-btn">Login</a>
        <a href="${resolvePath("auth/register.html")}" class="auth-btn">Register</a>
      </div>
    `;
    return;
  }

  // 🔐 Logged in → fetch user info
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

        <div class="user-dropdown hidden">
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

    // 🔽 Toggle dropdown
    const trigger = authArea.querySelector(".user-trigger");
    const dropdown = authArea.querySelector(".user-dropdown");

    trigger.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
    });

    // Click outside → close
    document.addEventListener("click", (e) => {
      if (!authArea.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });

    // 🚪 Logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      logout();
      window.location.href = resolvePath("auth/login.html");
    });

  } catch (err) {
    console.error("Error loading user info:", err);
    authArea.innerHTML = `
      <div class="auth-links">
        <a href="${resolvePath("auth/login.html")}" class="auth-btn">Login</a>
        <a href="${resolvePath("auth/register.html")}" class="auth-btn">Register</a>
      </div>
    `;
  }
}
