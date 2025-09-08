import { BASE_PATH } from "../js/apiConfig.js";

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
   Desktop Rendering
---------------------------- */
function renderDesktopUserDropdown(container, state) {
  const name = (state.username || state.email || "User").split(" ")[0];
  container.innerHTML = `
    <div class="dropdown">
      <a href="#" class="header-nav-link user-auth-link">
        <img src="${state.profileImage}" alt="${name}" class="user-avatar-desktop" />
      </a>
      <div class="dropdown-content">
        <span class="dropdown-header">Welcome, ${name}</span>
        <a href="${BASE_PATH}profile.html"><i class="fas fa-user"></i> Profile</a>
        ${state.role === "ADMIN" ? `
          <a href="${BASE_PATH}admin/admin-dashboard.html">
            <i class="fas fa-shield-alt"></i> Admin Dashboard
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

function renderDesktopGuestDropdown(container) {
  container.innerHTML = `
    <div class="dropdown">
      <a href="#" class="header-nav-link guest-auth-link">
        <i class="fas fa-user"></i>
      </a>
      <div class="dropdown-content">
        <span class="dropdown-header">My Account</span>
        <a href="${BASE_PATH}auth/login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a href="${BASE_PATH}auth/register.html"><i class="fas fa-user-plus"></i> Register</a>
      </div>
    </div>
  `;
}

/* ---------------------------
   Mobile Rendering
---------------------------- */
function renderMobileUserDropdown(container, state) {
  const name = (state.username || state.email || "User").split(" ")[0];
  container.innerHTML = `
    <div class="user-dropdown">
      <a href="#" class="header-nav-link mobile-user-link">
        <img src="${state.profileImage}" alt="${name}" class="user-avatar-mobile" />
        <span>${name}</span>
      </a>
      <div class="dropdown-content">
        <span class="dropdown-header">My Account</span>
        <a href="${BASE_PATH}profile.html"><i class="fas fa-user"></i> Profile</a>
        ${state.role === "ADMIN" ? `
          <a href="${BASE_PATH}admin/admin-dashboard.html">
            <i class="fas fa-shield-alt"></i> Admin Dashboard
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

function renderMobileGuestDropdown(container) {
  container.innerHTML = `
    <div class="user-dropdown">
      <a href="#" class="header-nav-link mobile-guest-link">
        <img src="${BASE_PATH}assets/icons/default-avatar.png" alt="Guest" class="user-avatar-mobile" />
        <span>Account</span>
      </a>
      <div class="dropdown-content">
        <span class="dropdown-header">My Account</span>
        <a href="${BASE_PATH}auth/login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a href="${BASE_PATH}auth/register.html"><i class="fas fa-user-plus"></i> Register</a>
      </div>
    </div>
  `;
}

/* ---------------------------
   Click outside handler for mobile
---------------------------- */
function initMobileAuthDropdown(container) {
  const link = container.querySelector('.header-nav-link');
  const dropdown = container.querySelector('.dropdown-content');

  if (!link || !dropdown) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('show');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

/* ---------------------------
   Public init
---------------------------- */
export function initAuthUI() {
  const desktopAuth = document.getElementById("auth-container");
  const mobileAuth = document.getElementById("auth-container-mobile");
  
  const state = getAuthState();

  // Desktop auth
  if (desktopAuth) {
    if (state.isAuthenticated) {
      renderDesktopUserDropdown(desktopAuth, state);
    } else {
      renderDesktopGuestDropdown(desktopAuth);
    }
  }

  // Mobile auth
  if (mobileAuth) {
    if (state.isAuthenticated) {
      renderMobileUserDropdown(mobileAuth, state);
    } else {
      renderMobileGuestDropdown(mobileAuth);
    }
    initMobileAuthDropdown(mobileAuth);
  }
}

// Auto-init
// document.addEventListener("DOMContentLoaded", initAuthUI);