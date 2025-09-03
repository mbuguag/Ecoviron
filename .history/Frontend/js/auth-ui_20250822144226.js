export function renderUserDropdown() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;
  const name = localStorage.getItem("username");
 const photo = localStorage.getItem("profileImage")?.startsWith("/uploads")
   ? `http://localhost:8080${localStorage.getItem("profileImage")}`
   : "/frontend/assets/icons/default-avatar.png";


  if (!name) {
    authArea.innerHTML = `<a href="/frontend/auth/login.html">Login</a>`;
    return;
  }// auth-ui.js - Optimized authentication UI
import { authService } from './auth.js';
import { BASE_PATH } from './apiConfig.js';

class AuthUI {
  constructor() {
    this.authContainer = null;
    this.init();
  }

  init() {
    this.authContainer = document.getElementById('auth-container');
    if (!this.authContainer) {
      console.warn('Auth container not found');
      return;
    }

    this.render();
    this.setupEventListeners();
  }

  render() {
    const user = authService.getCurrentUser();
    
    if (authService.isLoggedIn() && user) {
      this.renderLoggedInState(user);
    } else {
      this.renderLoggedOutState();
    }
  }

  renderLoggedInState(user) {
    const profileImage = authService.getProfileImage();
    
    this.authContainer.innerHTML = `
      <div class="user-dropdown">
        <img class="avatar-small" src="${profileImage}" alt="${user.username}" />
        <span>${user.username?.split(" ")[0] || 'User'}</span>
        <div class="dropdown-content">
          <div class="dropdown-header">My Account</div>
          <a href="${BASE_PATH}profile.html">Profile</a>
          <button id="logoutBtn">Logout</button>
        </div>
      </div>
    `;
  }

  renderLoggedOutState() {
    this.authContainer.innerHTML = `
      <div class="user-dropdown">
        <a href="${BASE_PATH}auth/login.html" class="header-nav-link">
          <i class="fas fa-user"></i> Login
        </a>
      </div>
    `;
  }

  setupEventListeners() {
    // Event delegation for logout button
    this.authContainer.addEventListener('click', (e) => {
      if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        e.preventDefault();
        this.handleLogout();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-dropdown')) {
        this.closeDropdown();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
  }

  async handleLogout() {
    try {
      authService.clearSession();
      this.showNotification('Logged out successfully!', 'success');
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = `${BASE_PATH}index.html`;
      }, 1000);
      
    } catch (error) {
      console.error('Logout failed:', error);
      this.showNotification('Logout failed. Please try again.', 'error');
    }
  }

  closeDropdown() {
    const dropdown = this.authContainer.querySelector('.dropdown-content');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.auth-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `auth-notification auth-notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new AuthUI();
});

// Export for manual initialization
export default AuthUI;

  authArea.innerHTML = `
    <div class="user-dropdown">
      <img class="avatar-small" src="${photo}" alt="${name}" />
      <span>${name.split(" ")[0]}</span>
      <div class="dropdown-content">
        <div class="dropdown-header">My Account</div>
        <a href="/frontend/profile.html">Profile</a>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/index.html";
  });
}
