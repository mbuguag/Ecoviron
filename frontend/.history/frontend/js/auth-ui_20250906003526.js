/**
 * auth-ui.js (patched)
 * - Renders login/register or user dropdown into BOTH #auth-container and #auth-container-mobile
 * - Listens for header lifecycle + auth changes
 * - Unified storage keys with your Auth.js: jwtToken, userRole, username, userEmail, profileImage
 */

import { BASE_PATH } from "./";

/* ---------------------------
   Auth state helpers
---------------------------- */

export function getAuthState() {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");
  let profileImage = localStorage.getItem("profileImage");

  // Normalize relative /uploads path coming from API
  if (profileImage && profileImage.startsWith("/uploads")) {
    // Prefer your production API host if available via env; leaving as-is here:
    profileImage = `https://api.bionix-hse.co.ke${profileImage}`;
  }

  return {
    isAuthenticated: !!token,
    token,
    role: role || "USER",
    username: username || null,
    email: email || null,
    profileImage: profileImage || `${BASE_PATH}assets/icons/default-avatar.png`,
  };
}

export function clearAuthState() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("profileImage");
}

/* ---------------------------
   Rendering
---------------------------- */

function containerEls() {
  return [
    document.getElementById("auth-container"),
    document.getElementById("auth-container-mobile"),
  ].filter(Boolean);
}

function htmlLoggedOut() {
  return `
    <a href="${BASE_PATH}auth/login.html" class="auth-login-link">
      <i class="fas fa-sign-in-alt"></i> Login
    </a>
    <a href="${BASE_PATH}auth/register.html" class="auth-register-link">
      <i class="fas fa-user-plus"></i> Register
    </a>
  `;
}

function htmlLoggedIn(state) {
  const name = (state.username || state.email || "User").split(" ")[0];
  return `
    <a href="#" class="header-nav-link">
      <img class="avatar-small" src="${state.profileImage}" alt="${name}" />
      <span class="user-name">${name}</span>
    </a>
    <div class="dropdown-content">
      <span class="dropdown-header">My Account</span>
      <a href="${BASE_PATH}profile.html" class="auth-profile-link">
        <i class="fas fa-user"></i> Profile
      </a>
      ${state.role === "ADMIN" ? `
      <a href="${BASE_PATH}admin/admin-dashboard.html">
        <i class="fas fa-shield-alt"></i> Admin
      </a>` : ""}
      <a href="#" class="auth-logout-link">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    </div>
  `;
}

export function renderAuthArea() {
  const state = getAuthState();
  containerEls().forEach((el) => {
    if (!el) return;
    el.innerHTML = state.isAuthenticated ? htmlLoggedIn(state) : htmlLoggedOut();

    // Wire logout link (if present)
    const logout = el.querySelector(".auth-logout-link");
    if (logout) {
      logout.addEventListener("click", (e) => {
        e.preventDefault();
        clearAuthState();
        renderAuthArea(); // re-render to logged-out view
        // Optional redirect:
        window.location.href = `${BASE_PATH}index.html`;
        // Broadcast
        document.dispatchEvent(new CustomEvent("auth:logout"));
      });
    }
  });
}

/* ---------------------------
   Lifecycle wiring
---------------------------- */

/**
 * Initialize once header is mounted (from components.js)
 * Also update when auth changes across tabs
 */
export function initAuthUI() {
  // Initial render if header is already in DOM
  renderAuthArea();

  // When the lazy-loaded header is mounted/replaced
  document.addEventListener("header:mounted", () => {
    renderAuthArea();
  });

  // Listen for login/logout events from your Auth.js flows
  document.addEventListener("auth:login", renderAuthArea);
  document.addEventListener("auth:logout", renderAuthArea);

  // Keep tabs in sync
  window.addEventListener("storage", (e) => {
    if (["jwtToken", "userRole", "username", "userEmail", "profileImage"].includes(e.key)) {
      renderAuthArea();
    }
  });
}

// Auto-init if this file is included globally
document.addEventListener("DOMContentLoaded", initAuthUI);