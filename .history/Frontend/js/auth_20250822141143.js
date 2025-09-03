// auth.js - Optimized authentication service
import { mergeGuestCartWithServer } from "./modules/guestCartMerge.js";
import { updateMiniCartCount } from "./cart-actions.js";

// Constants
const API_BASE = "http://localhost:8080/api";
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  REFRESH: `${API_BASE}/auth/refresh`,
  LOGOUT: `${API_BASE}/auth/logout`
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: "jwtToken",
  ROLE: "userRole",
  USERNAME: "username",
  EMAIL: "userEmail",
  PROFILE_IMAGE: "profileImage"
};

// Auth Service
class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    this.currentUser = {
      token: localStorage.getItem(STORAGE_KEYS.TOKEN),
      role: localStorage.getItem(STORAGE_KEYS.ROLE),
      username: localStorage.getItem(STORAGE_KEYS.USERNAME),
      email: localStorage.getItem(STORAGE_KEYS.EMAIL),
      profileImage: localStorage.getItem(STORAGE_KEYS.PROFILE_IMAGE)
    };
  }

  // Login handler
  async login(email, password) {
    try {
      // Clear previous session
      this.clearSession();

      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Invalid credentials");
      }

      const data = await response.json();
      this.saveSession(data);

      // Merge guest cart and update UI
      await mergeGuestCartWithServer();
      updateMiniCartCount();

      return this.getRedirectPath(data.role);
      
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  }

  // Registration handler
  async register(formData) {
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Registration failed");
      }

      sessionStorage.setItem(
        "loginMessage",
        "Account created successfully! Please log in."
      );
      
      return "login.html";
      
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  }

  // Session management
  saveSession(data) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.ROLE, data.role);
    localStorage.setItem(STORAGE_KEYS.USERNAME, data.fullName || data.name || "User");
    localStorage.setItem(STORAGE_KEYS.EMAIL, data.email);
    
    if (data.profileImageUrl) {
      localStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE, data.profileImageUrl);
    }
    
    this.loadUserFromStorage();
  }

  clearSession() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.currentUser = null;
  }

  // Redirect logic
  getRedirectPath(role) {
    if (role === "ADMIN") {
      return "../admin/admin-dashboard.html";
    }

    const redirect = sessionStorage.getItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");

    // Validate redirect URL
    if (redirect) {
      try {
        const url = new URL(redirect, window.location.origin);
        if (url.origin === window.location.origin) {
          return redirect;
        }
      } catch (e) {
        console.warn("Invalid redirect URL:", redirect);
      }
    }

    return "/frontend/index.html";
  }

  // Token refresh
  async refreshToken() {
    try {
      const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
        method: "POST",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.jwtToken);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed", error);
    }
    return false;
  }

  // Getters
  isLoggedIn() {
    return !!this.currentUser?.token;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getProfileImage() {
    const image = this.currentUser?.profileImage;
    return image?.startsWith("/uploads") 
      ? `http://localhost:8080${image}`
      : "/frontend/assets/icons/default-avatar.png";
  }
}

// Singleton instance
export const authService = new AuthService();

// Export individual functions for backward compatibility
export const isLoggedIn = () => authService.isLoggedIn();
export const getCurrentUser = () => authService.getCurrentUser();