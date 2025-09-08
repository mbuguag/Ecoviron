// header.js - Clean Refactor (Glitch-free, All Features Retained)

import { API_BASE_URL, BASE_PATH } from "./apiConfig.js";

class HeaderManager {
  constructor() {
    // Core elements
    this.header = document.querySelector(".site-header");
    this.menuToggle = document.querySelector(".header-menu-toggle");
    this.mobileNav = document.querySelector(".mobile-nav");
    this.mobileNavClose = document.querySelector(".mobile-nav-close");
    this.menuOverlay = document.querySelector(".menu-overlay");

    // Auth + Cart
    this.authContainers = document.querySelectorAll('[id^="auth-container"]');
    this.cartCountElements = document.querySelectorAll('[id^="mini-cart-count"]');

    // State
    this.isMenuOpen = false;
    this.currentUser = null;
    this.cartCount = 0;

    // Scroll throttle
    this.scrollTicking = false;

    this.init();
  }

  /* ==============================
   * Init
   * ============================== */
  init() {
    this.bindCoreEvents();
    this.setupScrollHeader();
    this.initAuth();
    this.initCart();
    this.setupAccessibility();
    this.handleResize(); // run once at start
  }

  /* ==============================
   * Events
   * ============================== */
  bindCoreEvents() {
    // Toggle menu
    this.menuToggle?.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });

    // Close menu
    this.mobileNavClose?.addEventListener("click", () => this.closeMobileMenu());
    this.menuOverlay?.addEventListener("click", () => this.closeMobileMenu());

    // Dropdowns
    this.initMobileDropdowns();
    this.initDesktopDropdowns();

    // Auth
    this.setupAuthListeners();

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) this.closeMobileMenu();
      if (e.key === "Tab" && this.isMenuOpen) this.handleTabKeyInMenu(e);
    });

    // Resize/orientation
    window.addEventListener("resize", this.debounce(() => this.handleResize(), 200));
    window.addEventListener("orientationchange", () =>
      setTimeout(() => this.handleResize(), 300)
    );
  }

  /* ==============================
   * Scroll Header Effect
   * ============================== */
  setupScrollHeader() {
    window.addEventListener(
      "scroll",
      () => {
        if (!this.scrollTicking) {
          requestAnimationFrame(() => {
            this.header?.classList.toggle("scrolled", window.scrollY > 50);
            this.scrollTicking = false;
          });
          this.scrollTicking = true;
        }
      },
      { passive: true }
    );
  }

  /* ==============================
   * Mobile Menu
   * ============================== */
  toggleMobileMenu() {
    this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
  }

  openMobileMenu() {
    if (this.isMenuOpen) return;
    this.isMenuOpen = true;

    this.menuToggle?.classList.add("active");
    this.mobileNav?.classList.add("active");
    this.menuOverlay?.classList.add("active");

    this.lockBodyScroll();
    this.menuToggle?.setAttribute("aria-expanded", "true");

    setTimeout(() => this.getFirstFocusable()?.focus(), 120);
  }

  closeMobileMenu() {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;

    this.menuToggle?.classList.remove("active");
    this.mobileNav?.classList.remove("active");
    this.menuOverlay?.classList.remove("active");

    this.unlockBodyScroll();
    this.menuToggle?.setAttribute("aria-expanded", "false");

    this.closeAllMobileDropdowns();
    this.menuToggle?.focus();
  }

  lockBodyScroll() {
    document.body.style.overflow = "hidden";
  }
  unlockBodyScroll() {
    document.body.style.overflow = "";
  }

  /* ==============================
   * Dropdowns
   * ============================== */
  initMobileDropdowns() {
    document.querySelectorAll(".mobile-nav .dropdown > a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdown = link.closest(".dropdown");
        const content = dropdown.querySelector(".dropdown-content");

        const isActive = dropdown.classList.contains("active");
        this.closeAllMobileDropdowns();

        if (!isActive && content) {
          dropdown.classList.add("active");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }

  closeAllMobileDropdowns() {
    document.querySelectorAll(".mobile-nav .dropdown.active").forEach((dd) => {
      dd.classList.remove("active");
      const content = dd.querySelector(".dropdown-content");
      if (content) content.style.maxHeight = "0";
    });
  }

  initDesktopDropdowns() {
    document.querySelectorAll(".site-header .dropdown").forEach((dropdown) => {
      const link = dropdown.querySelector("a");
      const content = dropdown.querySelector(".dropdown-content");
      if (!link || !content) return;

      let timer;
      dropdown.addEventListener("mouseenter", () => {
        clearTimeout(timer);
        content.style.display = "block";
      });
      dropdown.addEventListener("mouseleave", () => {
        timer = setTimeout(() => (content.style.display = ""), 150);
      });

      // Keyboard navigation
      link.addEventListener("keydown", (e) => {
        if (["ArrowDown", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          content.style.display = "block";
          content.querySelector("a")?.focus();
        }
      });
    });
  }

  /* ==============================
   * Auth
   * ============================== */
  setupAuthListeners() {
    document.querySelectorAll(".auth-login-link, .auth-register-link").forEach((link) =>
      link.addEventListener("click", () => this.isMenuOpen && this.closeMobileMenu())
    );

    document.querySelectorAll(".auth-logout-link").forEach((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      })
    );
  }

  initAuth() {
    try {
      const user = JSON.parse(localStorage.getItem("bionix_user") || "null");
      user?.token ? this.setAuthenticated(user) : this.setUnauthenticated();
    } catch {
      this.setUnauthenticated();
    }
  }

  setAuthenticated(user) {
    this.currentUser = user;
    this.authContainers.forEach((c) => {
      c.querySelector(".auth-login-link")?.classList.add("hidden");
      c.querySelector(".auth-register-link")?.classList.add("hidden");
      c.querySelector(".auth-profile-link")?.classList.remove("hidden");
      c.querySelector(".auth-logout-link")?.classList.remove("hidden");
    });
  }

  setUnauthenticated() {
    this.currentUser = null;
    this.authContainers.forEach((c) => {
      c.querySelector(".auth-login-link")?.classList.remove("hidden");
      c.querySelector(".auth-register-link")?.classList.remove("hidden");
      c.querySelector(".auth-profile-link")?.classList.add("hidden");
      c.querySelector(".auth-logout-link")?.classList.add("hidden");
    });
  }

  logout() {
    localStorage.removeItem("bionix_user");
    localStorage.removeItem("bionix_token");
    this.setUnauthenticated();
    this.notify("Logged out successfully!", "success");
    window.location.href = BASE_PATH || "/";
  }

  /* ==============================
   * Cart
   * ============================== */
  initCart() {
    this.updateCartFromStorage();
    document.addEventListener("cartUpdated", (e) => this.updateCart(e.detail.count));
  }

  updateCartFromStorage() {
    try {
      const cart = JSON.parse(localStorage.getItem("bionix_cart") || "[]");
      const count = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
      this.updateCart(count);
    } catch {
      this.updateCart(0);
    }
  }

  updateCart(count) {
    this.cartCount = count;
    this.cartCountElements.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  /* ==============================
   * Accessibility
   * ============================== */
  setupAccessibility() {
    this.menuToggle?.setAttribute("aria-expanded", "false");
    this.mobileNav?.setAttribute("role", "navigation");
    this.mobileNav?.setAttribute("aria-label", "Mobile navigation");
  }

  getFirstFocusable() {
    return this.mobileNav?.querySelector(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  getLastFocusable() {
    const els = this.mobileNav?.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return els?.[els.length - 1];
  }

  handleTabKeyInMenu(e) {
    const first = this.getFirstFocusable();
    const last = this.getLastFocusable();
    if (!first || !last) return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ==============================
   * Utils
   * ============================== */
  handleResize() {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  notify(msg, type = "info") {
    const div = document.createElement("div");
    div.className = `header-notification header-notification--${type}`;
    div.textContent = msg;

    div.style.cssText = `
      position: fixed; top: 80px; right: 20px;
      background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
      color: #fff; padding: 12px 20px; border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000;
      opacity: 0; transform: translateX(100%); transition: all .3s;
    `;

    document.body.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      div.style.opacity = "0";
      div.style.transform = "translateX(100%)";
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }
}


export default HeaderManager;

export function initHeader() {
  window.bionixHeader = new HeaderManager();
}

