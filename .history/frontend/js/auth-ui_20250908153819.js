import { BASE_PATH } from "../js/apiConfig.js";

// Singleton pattern to prevent duplicate initialization
let authManager = null;

class AuthManager {
  constructor() {
    if (authManager) return authManager;
    
    this.initialized = false;
    this.eventListeners = new Map(); // Track listeners for cleanup
    authManager = this;
  }

  getAuthState() {
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

  clearAuthState() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
  }

  // Clean up existing listeners before adding new ones
  cleanup() {
    this.eventListeners.forEach((removeListener, key) => {
      removeListener();
    });
    this.eventListeners.clear();
  }

  addEventListenerWithCleanup(element, event, handler, key) {
    // Remove existing listener if it exists
    if (this.eventListeners.has(key)) {
      this.eventListeners.get(key)();
    }

    // Add new listener
    element.addEventListener(event, handler);
    
    // Store cleanup function
    this.eventListeners.set(key, () => {
      element.removeEventListener(event, handler);
    });
  }

  renderDesktopUserDropdown(container, state) {
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

    // Add logout handler with cleanup
    const logoutLink = container.querySelector(".auth-logout-link");
    if (logoutLink) {
      this.addEventListenerWithCleanup(logoutLink, "click", (e) => {
        e.preventDefault();
        this.logout();
      }, `logout-desktop-${container.id}`);
    }
  }

  renderDesktopGuestDropdown(container) {
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

  renderMobileUserDropdown(container, state) {
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

    // Add logout handler with cleanup
    const logoutLink = container.querySelector(".auth-logout-link");
    if (logoutLink) {
      this.addEventListenerWithCleanup(logoutLink, "click", (e) => {
        e.preventDefault();
        this.logout();
      }, `logout-mobile-${container.id}`);
    }
  }

  renderMobileGuestDropdown(container) {
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

  initMobileAuthDropdown(container) {
    const link = container.querySelector('.header-nav-link');
    const dropdown = container.querySelector('.dropdown-content');

    if (!link || !dropdown) return;

    // Mobile toggle handler
    this.addEventListenerWithCleanup(link, "click", (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    }, `mobile-toggle-${container.id}`);

    // Click outside handler
    this.addEventListenerWithCleanup(document, "click", (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    }, `mobile-outside-${container.id}`);
  }

  logout() {
    this.clearAuthState();
    this.init(); // re-render as guest
    
    // Small delay to ensure DOM updates
    setTimeout(() => {
      window.location.href = `${BASE_PATH}index.html`;
    }, 100);
  }

  init() {
    // Prevent double initialization
    if (this.initialized) {
      this.cleanup();
    }

    const desktopAuth = document.getElementById("auth-container");
    const mobileAuth = document.getElementById("auth-container-mobile");
    
    // Early return if no auth containers found
    if (!desktopAuth && !mobileAuth) return;

    const state = this.getAuthState();

    // Desktop auth
    if (desktopAuth) {
      if (state.isAuthenticated) {
        this.renderDesktopUserDropdown(desktopAuth, state);
      } else {
        this.renderDesktopGuestDropdown(desktopAuth);
      }
    }

    // Mobile auth
    if (mobileAuth) {
      if (state.isAuthenticated) {
        this.renderMobileUserDropdown(mobileAuth, state);
      } else {
        this.renderMobileGuestDropdown(mobileAuth);
      }
      this.initMobileAuthDropdown(mobileAuth);
    }

    this.initialized = true;
  }

  // Public method to refresh auth state (useful after login/logout)
  refresh() {
    this.init();
  }
}

// Export singleton instance
export function initAuthUI() {
  const manager = new AuthManager();
  manager.init();
  return manager;
}

// Handle visibility change (tab switching)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && authManager) {
    // Small delay to ensure tab is fully active
    setTimeout(() => {
      authManager.refresh();
    }, 100);
  }
});

// Only auto-init if not already handled by main.js
if (!window.authUIInitialized) {
  document.addEventListener("DOMContentLoaded", () => {
    window.authUIInitialized = true;
    initAuthUI();
  });
}