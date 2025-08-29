// header.js
import { onLayoutReady } from "./apiConfig.js";

class HeaderManager {
  constructor() {
    this.header = document.querySelector(".site-header");
    this.menuToggle = document.querySelector(".header-menu-toggle");
    this.mobileNav = document.querySelector(".mobile-nav");
    this.mobileNavClose = document.querySelector(".mobile-nav-close");
    this.menuOverlay = document.querySelector(".menu-overlay");
    this.dropdowns = document.querySelectorAll(".dropdown");
    this.authContainers = document.querySelectorAll('[id^="auth-container"]');
    this.cartCountElements = document.querySelectorAll('[id^="mini-cart-count"]');

    // State
    this.isMenuOpen = false;
    this.currentUser = null;
    this.cartCount = 0;

    this.initialized = false;
  }

  init() {
    if (this.initialized) {
      console.debug("[header.js] HeaderManager already initialized, skipping.");
      return;
    }

    if (!this.header) {
      console.warn("[header.js] No .site-header found, skipping init.");
      return;
    }

    this.setupEventListeners();
    this.setupScrollHeader();
    this.initAuth();
    this.initCart();
    this.setupAccessibility();
    this.handleResize();

    this.initialized = true;
    console.log("[header.js] Header initialized.");
  }

  setupEventListeners() {
    // Mobile menu toggle
    this.menuToggle?.addEventListener("click", () => this.toggleMobileMenu());
    this.mobileNavClose?.addEventListener("click", () => this.closeMobileMenu());
    this.menuOverlay?.addEventListener("click", () => this.closeMobileMenu());

    // Mobile dropdown handling
    this.setupMobileDropdowns();

    // Desktop dropdown handling
    this.setupDesktopDropdowns();

    // Auth links
    this.setupAuthListeners();

    // Window resize only (scroll handled separately via setupScrollHeader)
    window.addEventListener("resize", () => this.handleResize());

    // Escape key closes menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  setupScrollHeader() {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.handleScroll(); // run once
  }

  handleScroll() {
    if (!this.header) return;
    const scrollY = window.scrollY;
    const threshold = 50;
    this.header.classList.toggle("scrolled", scrollY > threshold);
  }

  toggleMobileMenu() {
    this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.menuToggle?.classList.add("active");
    this.mobileNav?.classList.add("active");
    this.menuOverlay?.classList.add("active");
    document.body.style.overflow = "hidden";
    this.mobileNavClose?.focus();
    this.menuToggle?.setAttribute("aria-expanded", "true");
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.menuToggle?.classList.remove("active");
    this.mobileNav?.classList.remove("active");
    this.menuOverlay?.classList.remove("active");
    document.body.style.overflow = "";
    document.querySelectorAll(".mobile-nav .dropdown.active").forEach((d) =>
      d.classList.remove("active")
    );
    this.menuToggle?.setAttribute("aria-expanded", "false");
    this.menuToggle?.focus();
  }

  setupMobileDropdowns() {
    document.querySelectorAll(".mobile-nav .dropdown > a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdown = link.closest(".dropdown");
        const isActive = dropdown.classList.contains("active");
        document
          .querySelectorAll(".mobile-nav .dropdown.active")
          .forEach((d) => d !== dropdown && d.classList.remove("active"));
        dropdown.classList.toggle("active", !isActive);
      });
    });
  }

  setupDesktopDropdowns() {
    this.dropdowns.forEach((dropdown) => {
      const link = dropdown.querySelector("a");
      const content = dropdown.querySelector(".dropdown-content");
      if (!link || !content) return;

      let hoverTimeout;
      dropdown.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
        content.style.display = "block";
      });
      dropdown.addEventListener("mouseleave", () => {
        hoverTimeout = setTimeout(() => (content.style.display = ""), 150);
      });

      link.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          content.style.display = "block";
          content.querySelector("a")?.focus();
        }
      });
    });
  }

  setupAuthListeners() {
    document.querySelectorAll(".auth-logout-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });
  }

  initAuth() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    try {
      const userData = JSON.parse(localStorage.getItem("bionix_user") || "null");
      userData?.token
        ? this.setAuthenticatedState(userData)
        : this.setUnauthenticatedState();
    } catch {
      this.setUnauthenticatedState();
    }
  }

  setAuthenticatedState(user) {
    this.currentUser = user;
    this.authContainers.forEach((container) => {
      container.querySelector(".auth-login-link")?.style.setProperty("display", "none");
      container.querySelector(".auth-register-link")?.style.setProperty("display", "none");
      container.querySelector(".auth-profile-link")?.style.setProperty("display", "block");
      container.querySelector(".auth-logout-link")?.style.setProperty("display", "block");
    });
  }

  setUnauthenticatedState() {
    this.currentUser = null;
    this.authContainers.forEach((container) => {
      container.querySelector(".auth-login-link")?.style.setProperty("display", "block");
      container.querySelector(".auth-register-link")?.style.setProperty("display", "block");
      container.querySelector(".auth-profile-link")?.style.setProperty("display", "none");
      container.querySelector(".auth-logout-link")?.style.setProperty("display", "none");
    });
  }

  handleLogout() {
    localStorage.removeItem("bionix_user");
    localStorage.removeItem("bionix_token");
    this.setUnauthenticatedState();
    this.showNotification("Successfully logged out!", "success");
    window.location.href = window.BASE_PATH || "/";
  }

  initCart() {
    this.loadCartCount();
    document.addEventListener("cartUpdated", (e) =>
      this.updateCartCount(e.detail.count)
    );
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
    this.cartCountElements.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  setupAccessibility() {
    this.menuToggle?.setAttribute("aria-label", "Toggle navigation menu");
    this.mobileNav?.setAttribute("role", "navigation");
    this.mobileNav?.setAttribute("aria-label", "Mobile navigation");
    this.setupFocusTrap();
  }

  setupFocusTrap() {
    const selectors =
      "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])";
    document.addEventListener("keydown", (e) => {
      if (!this.isMenuOpen || e.key !== "Tab") return;
      const focusables = this.mobileNav?.querySelectorAll(selectors);
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  }

  handleResize() {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `header-notification header-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 80px; right: 20px;
      background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
      color: white; padding: 12px 20px; border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000; opacity: 0; transform: translateX(100%);
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
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Public API
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
      const existing = cart.find((i) => i.id === product.id);
      existing ? (existing.quantity += quantity) : cart.push({ ...product, quantity });
      localStorage.setItem("bionix_cart", JSON.stringify(cart));
      this.loadCartCount();
      document.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { count: this.cartCount, cart } })
      );
      this.showNotification(`${product.name || "Item"} added to cart!`, "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      this.showNotification("Error adding item to cart", "error");
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getCartCount() {
    return this.cartCount;
  }
}

// Initialize only after layout is ready
onLayoutReady(() => {
  window.bionixHeader = new HeaderManager();
  window.bionixHeader.init();
});

export default HeaderManager;
