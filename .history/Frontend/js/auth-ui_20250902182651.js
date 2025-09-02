// auth-ui.js
import { BASE_PATH } from "../apiConfig.js";

/**
 * Utility: check if user is authenticated
 * Looks for token or user object in localStorage/sessionStorage
 */
function isAuthenticated() {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  return token && user;
}

/**
 * Utility: get user object
 */
function getUser() {
  try {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("user");
  window.location.href = `${BASE_PATH}auth/login.html`;
}

/**
 * Render auth UI
 * @param {HTMLElement} container - The placeholder (#authArea or #authAreaMobile)
 * @param {boolean} isMobile - Whether this is rendering inside mobile nav
 */
export function renderAuthUI(container, isMobile = false) {
  if (!container) return;

  const authed = isAuthenticated();
  const user = getUser();

  // Build dropdown content
  let html = `
    <a href="#" class="header-nav-link">
      <i class="fas fa-user"></i> ${authed && user ? user.name || "Account" : ""}
    </a>
    <div class="dropdown-content">
      <span class="dropdown-header">My Account</span>
  `;

  if (!authed) {
    // Guest view
    html += `
      <a href="${BASE_PATH}auth/login.html" class="auth-login-link">
        <i class="fas fa-sign-in-alt"></i> Login
      </a>
      <a href="${BASE_PATH}auth/register.html" class="auth-register-link">
        <i class="fas fa-user-plus"></i> Register
      </a>
    `;
  } else {
    // Authenticated view
    html += `
      <a href="${BASE_PATH}profile.html" class="auth-profile-link">
        <i class="fas fa-user"></i> Profile
      </a>
      <a href="#" class="auth-logout-link">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    `;
  }

  html += `</div>`;

  // Inject HTML
  container.classList.add("user-dropdown");
  container.innerHTML = html;

  // Attach logout handler if logged in
  if (authed) {
    const logoutLink = container.querySelector(".auth-logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
  }
}
