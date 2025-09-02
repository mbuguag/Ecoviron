// auth-ui.js
import { BASE_PATH } from "../apiConfig.js";

// Simulated auth check (replace with your real auth logic)
function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.reload();
}

function renderAuthDropdown(container, isMobile = false) {
  const user = getCurrentUser();
  let html = "";

  if (!user) {
    // Unauthenticated state
    html = `
      <div class="user-dropdown">
        <a href="#" class="header-nav-link">
          <i class="fas fa-user"></i>
        </a>
        <div class="dropdown-content">
          <span class="dropdown-header">My Account</span>
          <a href="${BASE_PATH}auth/login.html" class="auth-login-link">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="${BASE_PATH}auth/register.html" class="auth-register-link">
            <i class="fas fa-user-plus"></i> Register
          </a>
        </div>
      </div>
    `;
  } else {
    // Authenticated state
    html = `
      <div class="user-dropdown">
        <a href="#" class="header-nav-link">
          <i class="fas fa-user"></i> ${user.name || "Account"}
        </a>
        <div class="dropdown-content">
          <span class="dropdown-header">Welcome, ${user.name || "User"}</span>
          <a href="${BASE_PATH}profile.html" class="auth-profile-link">
            <i class="fas fa-user"></i> Profile
          </a>
          <a href="#" class="auth-logout-link">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Attach logout handler if needed
  const logoutLink = container.querySelector(".auth-logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
}

export function initAuthUI() {
  const desktopAuthArea = document.getElementById("authArea");
  const mobileAuthArea = document.getElementById("authAreaMobile");

  if (desktopAuthArea) {
    renderAuthDropdown(desktopAuthArea, false);
  }
  if (mobileAuthArea) {
    renderAuthDropdown(mobileAuthArea, true);
  }
}

// Auto-run on DOM load
document.addEventListener("DOMContentLoaded", initAuthUI);
