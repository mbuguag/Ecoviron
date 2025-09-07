/**
 * auth-ui.js (patched)
 * - Renders login/register or user dropdown into BOTH #auth-container and #auth-container-mobile
 * - Listens for header lifecycle + auth changes
 * - Unified storage keys with your Auth.js: jwtToken, userRole, username, userEmail, profileImage
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

// =============================
// Auth Dropdown Toggle
// =============================
function initAuthDropdown() {
  const authArea = document.querySelector(".header-auth");
  if (!authArea) return;

  const button = authArea.querySelector(".header-auth-button");
  const dropdown = authArea.querySelector(".header-auth-dropdown");

  if (!button || !dropdown) return;

  // Toggle dropdown on button click
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!authArea.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  // Optional: Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("show");
    }
  });
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initAuthDropdown();
});

/* ---------------------------
   Lifecycle wiring
---------------------------- */

/**
 * Initialize once header is mounted (from components.js)
 * Also update when auth changes across tabs
 */
// =============================
// Auth UI Manager
// =============================
export function initAuthUI() {
  const authArea = document.querySelector(".header-auth");
  if (!authArea) return;

  // Example: Replace this with your real auth check (JWT/localStorage/API)
  const user = getCurrentUser();

  if (user) {
    renderUserDropdown(authArea, user);
  } else {
    renderGuestDropdown(authArea);
  }
  initAuthDropdown(); // attach toggle behavior
}

// =============================
// Render for Logged-in User
// =============================
function renderUserDropdown(container, user) {
  container.innerHTML = `
    <div class="header-auth-item user-dropdown">
      <button class="header-auth-button header-nav-link">
        <img src="${user.avatar || "/assets/icons/default-avatar.png"}" 
             alt="User Avatar" class="user-avatar">
      </button>
      <div class="header-auth-dropdown dropdown-content">
        <a href="/account.html">Account</a>
        <a href="/orders.html">Orders</a>
        <a href="/settings.html">Settings</a>
        <a href="#" id="logout-link">Logout</a>
      </div>
    </div>
  `;

  // Logout handler
  container.querySelector("#logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    logoutUser();
    initAuthUI(); // re-render as guest
  });
}

// =============================
// Render for Guest User
// =============================
function renderGuestDropdown(container) {
  container.innerHTML = `
    <div class="header-auth-item guest-dropdown">
      <button class="header-auth-button header-nav-link">
        <i class="fas fa-user"></i> Login / Register
      </button>
      <div class="header-auth-dropdown dropdown-content">
        <a href="/login.html">Login</a>
        <a href="/register.html">Register</a>
      </div>
    </div>
  `;
}

// =============================
// Toggle Dropdown (shared)
// =============================
function initAuthDropdown() {
  const authArea = document.querySelector(".header-auth");
  if (!authArea) return;

  const button = authArea.querySelector(".header-auth-button");
  const dropdown = authArea.querySelector(".header-auth-dropdown");

  if (!button || !dropdown) return;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!authArea.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("show");
    }
  });
}

// =============================
// Mock helpers (replace with real API)
// =============================
function getCurrentUser() {
  // Example only — integrate with your auth system
  return JSON.parse(localStorage.getItem("user")) || null;
}

function logoutUser() {
  localStorage.removeItem("user");
}


// Auto-init if this file is included globally
document.addEventListener("DOMContentLoaded", initAuthUI);