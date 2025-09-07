/**
 * auth-ui.js (cleaned up)
 * - Renders login/register dropdown (guest) or user dropdown (auth)
 * - Works for both #auth-container and #auth-container-mobile
 * - Uses a single source of truth: localStorage keys (jwtToken, userRole, username, userEmail, profileImage)
 */

import { BASE_PATH } from "../js/apiConfig.js";

/* ---------------------------
   Auth state helpers
---------------------------- */

export function getAuthState() {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");
  let profileImage = localStorage.getItem("profileImage");

  if (profileImage && profileImage.startsWith("/uploads")) {
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

function renderGuestDropdown(container) {
  container.innerHTML = `
    <div class="header-auth-item guest-dropdown">
      <button class="header-auth-button header-nav-link">
        <i class="fas fa-user"></i> Login / Register
      </button>
      <div class="header-auth-dropdown dropdown-content">
        <a href="${BASE_PATH}auth/login.html">Login</a>
        <a href="${BASE_PATH}auth/register.html">Register</a>
      </div>
    </div>
  `;
}

function renderUserDropdown(container, state) {
  const name = (state.username || state.email || "User").split(" ")[0];
  container.innerHTML = `
    <div class="header-auth-item user-dropdown">
      <button class="header-auth-button header-nav-link">
        <img src="${state.profileImage}" 
             alt="${name}" class="user-avatar avatar-small">
        <span class="user-name">${name}</span>
      </button>
      <div class="header-auth-dropdown dropdown-content">
        <span class="dropdown-header">My Account</span>
        <a href="${BASE_PATH}profile.html">
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
    </div>
  `;

  // logout handler
  const logoutLink = container.querySelector(".auth-logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearAuthState();
      renderAuthArea(); // refresh to guest state
      window.location.href = `${BASE_PATH}index.html`; // optional redirect
      document.dispatchEvent(new CustomEvent("auth:logout"));
    });
  }
}

/* ---------------------------
   Dropdown toggle behavior
---------------------------- */
function initAuthDropdown(container) {
  const button = container.querySelector(".header-auth-button");
  const dropdown = container.querySelector(".header-auth-dropdown");
  if (!button || !dropdown) return;

  // toggle
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // close outside
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("show");
    }
  });
}

/* ---------------------------
   Main render
---------------------------- */
export function renderAuthArea() {
  const state = getAuthState();

  containerEls().forEach((el) => {
    if (state.isAuthenticated) {
      renderUserDropdown(el, state);
    } else {
      renderGuestDropdown(el);
    }
    initAuthDropdown(el); // reattach toggle after render
  });
}

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", renderAuthArea);
