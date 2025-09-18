// auth.js - Handles user authentication (login, registration, token management)
import { mergeGuestCartWithServer } from "./modules/guestCartMerge.js";
import { updateMiniCartCount } from "./cart-actions.js";

// Redirect after login based on context (checkout or normal)
function getPostLoginRedirect(role = "USER") {
  const redirect = sessionStorage.getItem("redirectAfterLogin");
  sessionStorage.removeItem("redirectAfterLogin");

  if (redirect) {// auth.js - Handles user authentication (UI + logic)

import { BASE_PATH } from "../js/apiConfig.js";
import { mergeGuestCartWithServer } from "./modules/guestCartMerge.js";
import { updateMiniCartCount } from "./cart-actions.js";

// Singleton pattern
let authManager = null;

class AuthManager {
  constructor() {
    if (authManager) return authManager;

    this.initialized = false;
    this.eventListeners = new Map();
    authManager = this;
  }

  // --- AUTH STATE ---
  getAuthState() {
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
      role: role || "USER",
      username: username || null,
      email: email || null,
      profileImage:
        profileImage || `${BASE_PATH}assets/icons/default-avatar.png`,
    };
  }

  clearAuthState() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
  }

  // --- EVENT LISTENER MGMT ---
  cleanup() {
    this.eventListeners.forEach((removeListener) => removeListener());
    this.eventListeners.clear();
  }

  addEventListenerWithCleanup(element, event, handler, key) {
    if (this.eventListeners.has(key)) {
      this.eventListeners.get(key)();
    }
    element.addEventListener(event, handler);
    this.eventListeners.set(key, () => {
      element.removeEventListener(event, handler);
    });
  }

  // --- DROPDOWNS ---
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
          ${
            state.role === "ADMIN"
              ? `<a href="${BASE_PATH}admin/admin-dashboard.html">
                  <i class="fas fa-shield-alt"></i> Admin Dashboard
                 </a>`
              : ""
          }
          <a href="#" class="auth-logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>
    `;
    const logoutLink = container.querySelector(".auth-logout-link");
    if (logoutLink) {
      this.addEventListenerWithCleanup(
        logoutLink,
        "click",
        (e) => {
          e.preventDefault();
          this.logout();
        },
        `logout-desktop-${container.id}`
      );
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
          ${
            state.role === "ADMIN"
              ? `<a href="${BASE_PATH}admin/admin-dashboard.html">
                  <i class="fas fa-shield-alt"></i> Admin Dashboard
                 </a>`
              : ""
          }
          <a href="#" class="auth-logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>
    `;
    const logoutLink = container.querySelector(".auth-logout-link");
    if (logoutLink) {
      this.addEventListenerWithCleanup(
        logoutLink,
        "click",
        (e) => {
          e.preventDefault();
          this.logout();
        },
        `logout-mobile-${container.id}`
      );
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
    const link = container.querySelector(".header-nav-link");
    const dropdown = container.querySelector(".dropdown-content");
    if (!link || !dropdown) return;

    this.addEventListenerWithCleanup(
      link,
      "click",
      (e) => {
        e.preventDefault();
        dropdown.classList.toggle("show");
      },
      `mobile-toggle-${container.id}`
    );

    this.addEventListenerWithCleanup(
      document,
      "click",
      (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.remove("show");
        }
      },
      `mobile-outside-${container.id}`
    );
  }

  // --- INIT / LOGOUT ---
  logout() {
    this.clearAuthState();
    this.init();
    setTimeout(() => {
      window.location.href = `${BASE_PATH}index.html`;
    }, 100);
  }

  init() {
    if (this.initialized) this.cleanup();

    const desktopAuth = document.getElementById("auth-container");
    const mobileAuth = document.getElementById("auth-container-mobile");
    if (!desktopAuth && !mobileAuth) return;

    const state = this.getAuthState();

    if (desktopAuth) {
      state.isAuthenticated
        ? this.renderDesktopUserDropdown(desktopAuth, state)
        : this.renderDesktopGuestDropdown(desktopAuth);
    }

    if (mobileAuth) {
      state.isAuthenticated
        ? this.renderMobileUserDropdown(mobileAuth, state)
        : this.renderMobileGuestDropdown(mobileAuth);
      this.initMobileAuthDropdown(mobileAuth);
    }

    this.initialized = true;
  }

  refresh() {
    this.init();
  }
}

// --- LOGIN / REGISTER HELPERS ---
function getPostLoginRedirect(role = "USER") {
  const redirect = sessionStorage.getItem("redirectAfterLogin");
  sessionStorage.removeItem("redirectAfterLogin");

  if (redirect) {
    try {
      const url = new URL(redirect, window.location.origin);
      if (url.origin === window.location.origin) return redirect;
    } catch (e) {
      console.warn("Invalid redirect URL:", redirect);
    }
  }
  return role === "ADMIN"
    ? `${BASE_PATH}admin/admin-dashboard.html`
    : `${BASE_PATH}index.html`;
}

export function handleLogin(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      ["jwtToken", "userRole", "profileImage", "username", "userEmail"].forEach(
        (k) => localStorage.removeItem(k)
      );

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value.trim(),
          password: form.password.value.trim(),
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.fullName || data.name || "User");
      localStorage.setItem("userEmail", data.email);
      if (data.profileImageUrl) {
        localStorage.setItem("profileImage", data.profileImageUrl);
      }

      await mergeGuestCartWithServer();
      updateMiniCartCount();

      window.location.href = getPostLoginRedirect(data.role);
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}

export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    try {
      const formData = new FormData(form);
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const msg = await res.text();

      if (!res.ok) throw new Error(msg);

      sessionStorage.setItem(
        "loginMessage",
        "Account created successfully! Please log in."
      );
      window.location.href = "login.html";
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      button.disabled = false;
      button.textContent = "Register";
    }
  });
}

// --- TOKEN + UTILITIES ---
export async function refreshToken() {
  try {
    const res = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwtToken", data.jwtToken);
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }
  return false;
}

export function isLoggedIn() {
  return !!localStorage.getItem("jwtToken");
}

// --- EXPORT SINGLETON ---
export function initAuthUI() {
  const manager = new AuthManager();
  manager.init();
  return manager;
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && authManager) {
    setTimeout(() => authManager.refresh(), 100);
  }
});

if (!window.authUIInitialized) {
  document.addEventListener("DOMContentLoaded", () => {
    window.authUIInitialized = true;
    initAuthUI();
  });
}

    try {
      const url = new URL(redirect, window.location.origin);
      if (url.origin === window.location.origin) {
        return redirect;
      }
    } catch (e) {
      console.warn("Invalid redirect URL:", redirect);
    }
  }

  // ✅ Role-based fallback
  if (role === "ADMIN") {
    return "/admin/admin-dashboard.html"; // works both locally & on Vercel
  }

  return "/"; // homepage for normal users
}


// Login Handler
export function handleLogin(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const button = form.querySelector("button");

    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      // Clear any previous session
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("username");
      localStorage.removeItem("userEmail");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value.trim(),
          password: form.password.value.trim(),
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.fullName || data.name || "User");
      localStorage.setItem("userEmail", data.email);

      if (data.profileImageUrl) {
        localStorage.setItem("profileImage", data.profileImageUrl);
      }

      // Merge guest cart → authenticated cart
      await mergeGuestCartWithServer();
      updateMiniCartCount();

      // Redirect logic
      if (data.role === "ADMIN") {
        window.location.href = "../admin/admin-dashboard.html";
      } else {
        window.location.href = getPostLoginRedirect();
      }
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}

// Registration Handler
export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    try {
      const formData = new FormData(form); // automatically collects all input fields including file

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData, // Do NOT set headers — browser will set multipart/form-data with boundary
      });

      const msg = await res.text();

      if (!res.ok) throw new Error(msg);

      sessionStorage.setItem(
        "loginMessage",
        "Account created successfully! Please log in."
      );
      window.location.href = "login.html";
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      button.disabled = false;
      button.textContent = "Register";
    }
  });
}

// Token Refresh (optional)
export async function refreshToken() {
  try {
    const res = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwtToken", data.jwtToken);
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }

  return false;
}

// Check login status
export function isLoggedIn() {
  const token = localStorage.getItem("jwtToken");
  return !!token;
}
