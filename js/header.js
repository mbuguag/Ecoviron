// ==========================================
// BIONIX-EHS Header JavaScript Module
// Delegation-based HeaderManager
// ==========================================

import { fetchFeaturedProducts } from "./api.js";
import { setupCartInteractions } from "./cart-actions.js";

class HeaderManager {
  constructor() {
    this.header = document.querySelector(".site-header");

    // State
    this.isMenuOpen = false;
    this.currentUser = null;
    this.cartCount = 0;

    this.init();
  }

  init() {
    this.setupDelegatedListeners();
    this.setupScrollHeader();
    this.initAuth();
    this.initCart();
    this.setupAccessibility();
    this.handleResize();
  }

  // ------------------------------
  // 🔹 Delegated Event Listeners
  // ------------------------------
  setupDelegatedListeners() {
    const root = document;

    root.addEventListener("click", (e) => {
      const target = e.target;

      // Mobile menu toggle
      if (target.closest(".header-menu-toggle")) {
        e.preventDefault();
        this.toggleMobileMenu();
        return;
      }

      // Mobile nav close
      if (target.closest(".mobile-nav-close")) {
        e.preventDefault();
        this.closeMobileMenu();
        return;
      }

      // Overlay
      if (target.closest(".menu-overlay")) {
        e.preventDefault();
        this.closeMobileMenu();
        return;
      }

      // Mobile dropdown toggle
      const mobileDropdownLink = target.closest(".mobile-nav .dropdown > a");
      if (mobileDropdownLink) {
        e.preventDefault();
        const dropdown = mobileDropdownLink.closest(".dropdown");
        const isActive = dropdown.classList.contains("active");

        document.querySelectorAll(".mobile-nav .dropdown.active")
          .forEach(d => { if (d !== dropdown) d.classList.remove("active"); });

        dropdown.classList.toggle("active", !isActive);
        return;
      }

      // Cart icon
      if (target.closest(".cart-icon")) {
        e.preventDefault();
        this.openMiniCart?.();
        return;
      }

      // Auth links
      if (target.closest(".auth-login-link")) return;
      if (target.closest(".auth-register-link")) return;

      if (target.closest(".auth-logout-link")) {
        e.preventDefault();
        this.handleLogout();
        return;
      }
    });

    // Esc key closes menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Window events
    window.addEventListener("resize", () => this.handleResize());
    window.addEventListener("scroll", () => this.handleScroll());
  }

  // ------------------------------
  // Scroll + Resize
  // ------------------------------
  setupScrollHeader() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  handleScroll() {
    if (!this.header) return;
    this.header.classList.toggle("scrolled", window.scrollY > 50);
  }

  handleResize() {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // ------------------------------
  // Mobile Menu
  // ------------------------------
  toggleMobileMenu() {
    this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    document.querySelector(".header-menu-toggle")?.classList.add("active");
    document.querySelector(".mobile-nav")?.classList.add("active");
    document.querySelector(".menu-overlay")?.classList.add("active");
    document.body.style.overflow = "hidden";
    document.querySelector(".mobile-nav-close")?.focus();
    document.querySelector(".header-menu-toggle")?.setAttribute("aria-expanded", "true");
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    document.querySelector(".header-menu-toggle")?.classList.remove("active");
    document.querySelector(".mobile-nav")?.classList.remove("active");
    document.querySelector(".menu-overlay")?.classList.remove("active");
    document.body.style.overflow = "";

    document.querySelectorAll(".mobile-nav .dropdown.active")
      .forEach(dropdown => dropdown.classList.remove("active"));

    document.querySelector(".header-menu-toggle")?.setAttribute("aria-expanded", "false");
    document.querySelector(".header-menu-toggle")?.focus();
  }

  // ------------------------------
  // Auth
  // ------------------------------
  initAuth() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    try {
      const userData = JSON.parse(localStorage.getItem("bionix_user") || "null");
      if (userData?.token) {
        this.setAuthenticatedState(userData);
      } else {
        this.setUnauthenticatedState();
      }
    } catch (err) {
      console.warn("Auth check error:", err);
      this.setUnauthenticatedState();
    }
  }

  setAuthenticatedState(user) {
    this.currentUser = user;
    this.renderAuthUI(true, user);
  }

  setUnauthenticatedState() {
    this.currentUser = null;
    this.renderAuthUI(false);
  }

  renderAuthUI(isAuth, user = null) {
    const areas = [document.querySelector("#authArea"), document.querySelector("#authAreaMobile")];
    areas.forEach(area => {
      if (!area) return;

      if (isAuth) {
        area.innerHTML = `
          <a href="/account" class="auth-profile-link">
            <i class="fas fa-user"></i> ${user.name || user.email || "User"}
          </a>
          <a href="#" class="auth-logout-link">Logout</a>
        `;
      } else {
        area.innerHTML = `
          <a href="/login" class="auth-login-link">Login</a>
          <a href="/register" class="auth-register-link">Register</a>
        `;
      }
    });
  }

  handleLogout() {
    localStorage.removeItem("bionix_user");
    localStorage.removeItem("bionix_token");
    this.setUnauthenticatedState();
    this.showNotification("Successfully logged out!", "success");
    window.location.href = window.BASE_PATH || "/";
  }

  // ------------------------------
  // Cart
  // ------------------------------
  initCart() {
    this.loadCartCount();
    document.addEventListener("cartUpdated", (e) => {
      this.updateCartCount(e.detail.count);
    });
  }

  loadCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("bionix_cart") || "[]");
      const count = cart.reduce((t, i) => t + (i.quantity || 1), 0);
      this.updateCartCount(count);
    } catch {
      this.updateCartCount(0);
    }
  }

  updateCartCount(count) {
    this.cartCount = count;
    document.querySelectorAll('[id^="mini-cart-count"]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  // ------------------------------
  // Accessibility
  // ------------------------------
  setupAccessibility() {
    document.querySelector(".header-menu-toggle")
      ?.setAttribute("aria-label", "Toggle navigation menu");
    document.querySelector(".mobile-nav")
      ?.setAttribute("role", "navigation");
    document.querySelector(".mobile-nav")
      ?.setAttribute("aria-label", "Mobile navigation");

    this.setupFocusTrap();
  }

  setupFocusTrap() {
    const focusable = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    document.addEventListener("keydown", (e) => {
      if (!this.isMenuOpen || e.key !== "Tab") return;

      const focusableEls = document.querySelector(".mobile-nav")?.querySelectorAll(focusable);
      if (!focusableEls?.length) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  }

  // ------------------------------
  // Utilities
  // ------------------------------
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `header-notification header-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ------------------------------
  // Public API
  // ------------------------------
  updateUser(userData) {
    if (userData) {
      localStorage.setItem("bionix_user", JSON.stringify(userData));
      this.setAuthenticatedState(userData);
    } else {
      this.handleLogout();
    }
  }

  addToCart(product, quantity = 1) {
    try {
      const cart = JSON.parse(localStorage.getItem("bionix_cart") || "[]");
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }

      localStorage.setItem("bionix_cart", JSON.stringify(cart));
      this.loadCartCount();

      document.dispatchEvent(new CustomEvent("cartUpdated", {
        detail: { count: this.cartCount, cart }
      }));

      this.showNotification(`${product.name || "Item"} added to cart!`, "success");
    } catch (err) {
      console.error("Cart add error:", err);
      this.showNotification("Error adding item to cart", "error");
    }
  }

  getCurrentUser() { return this.currentUser; }
  getCartCount() { return this.cartCount; }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  window.bionixHeader = new HeaderManager();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = HeaderManager;
}
