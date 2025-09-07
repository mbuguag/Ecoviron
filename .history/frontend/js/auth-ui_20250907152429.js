import { BASE_PATH } from "../js/apiConfig.js";

/* ---------------------------
   Auth state helpers
---------------------------- */
function getAuthState() {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");
  let profileImage = localStorage.getItem("profileImage");

  // Normalize relative paths
  if (profileImage && profileImage.startsWith("/uploads")) {
    profileImage = `https://api.bionix-hse.co.ke${profileImage}`;
  }

  return {
    isAuthenticated: !!token,
    role: role || "USER",
    username: username || null,
    email: email || null,
    profileImage: profileImage || `${BASE_PATH}assets/icons/default-avatar.png`,
  };
}

function clearAuthState() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("profileImage");
}

/* ---------------------------
   Rendering
---------------------------- */
function renderUserDropdown(container, state) {
  const name = (state.username || state.email || "User").split(" ")[0];
  container.innerHTML = `
    <div class="header-auth-item user-dropdown">
      <button class="header-auth-button header-nav-link">
        <img src="${state.profileImage}" alt="${name}" class="user-avatar" />
        <span class="user-name">${name}</span>
      </button>
      <div class="header-auth-dropdown dropdown-content">
        <a href="${BASE_PATH}profile.html"><i class="fas fa-user"></i> Profile</a>
        ${state.role === "ADMIN" ? `
          <a href="${BASE_PATH}admin/admin-dashboard.html">
            <i class="fas fa-shield-alt"></i> Admin
          </a>` : ""}
        <a href="#" class="auth-logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    </div>
  `;

  // Logout handler
  container.querySelector(".auth-logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    clearAuthState();
    initAuthUI(); // re-render as guest
    window.location.href = `${BASE_PATH}index.html`;
  });
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

/* ---------------------------
   Dropdown toggle
---------------------------- */
function initAuthDropdown(container) {
  const button = container.querySelector(".header-auth-button");
  const dropdown = container.querySelector(".header-auth-dropdown");

  if (!button || !dropdown) return;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("show");
    }
  });
}

/* ---------------------------
   Public init
---------------------------- */
export function initAuthUI() {
  const authAreas = [
    document.getElementById("auth-container"),
    document.getElementById("auth-container-mobile"),
  ].filter(Boolean);

  if (authAreas.length === 0) return;

  const state = getAuthState();

  authAreas.forEach((container) => {
    if (state.isAuthenticated) {
      renderUserDropdown(container, state);
    } else {
      renderGuestDropdown(container);
    }
    initAuthDropdown(container);
  });
}

// Auto-init
document.addEventListener("DOMContentLoaded", initAuthUI);
