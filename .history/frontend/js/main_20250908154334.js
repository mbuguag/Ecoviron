// main.js

import { initCarousel } from "./modules/carousel.js";
import { initContactForm } from "./modules/contact.js";
import { initFeaturedProducts } from "./modules/featured-products.js";
import { initServices } from "./modules/services.js";
import { initAboutSection } from "./modules/about.js";
import { loadLayoutComponents } from "./modules/components.js";
import { updateMiniCartCount } from "./cart-actions.js";
import { loadQuoteModal } from "./modules/quote-modal.js";
import { initAuthUI } from "./auth-ui.js";  
import { initNewsletter } from "./modules/newsletter.js";
import { initPPESlider } from "./modules/ppe-sliders.js";
import { initBreadcrumbs } from "./modules/breadcrumbs.js";
import { BASE_PATH } from "./apiConfig.js";
import { initHeader } from "./header.js";

/**
 * Sticky Header
 */
function initStickyHeader() {
  const headerEl = document.querySelector(".site-header");
  if (!headerEl) return;

  const stickyClass = "sticky";
  const threshold = 100;
  let ticking = false;

  function toggleSticky() {
    if (window.scrollY > threshold) {
      headerEl.classList.add(stickyClass);
      document.body.classList.add("has-sticky");
    } else {
      headerEl.classList.remove(stickyClass);
      document.body.classList.remove("has-sticky");
    }
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(toggleSticky);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  toggleSticky(); // run once on load
}

/**
 * Prevent duplicate initialization
 */
let initialized = false;

/**
 * Main App Initialization
 */
window.addEventListener("DOMContentLoaded", async () => {
  // Prevent double initialization
  if (initialized) return;
  initialized = true;

  console.log("DOM Content Loaded - Starting initialization...");
  console.log("BASE_PATH:", BASE_PATH);

  try {
    console.log("Loading layout components...");
    await loadLayoutComponents();
    console.log("Layout components loaded successfully");

    // Initialize header manager
    initHeader();

    // Mark auth as handled by main.js to prevent double init
    window.authUIInitialized = true;
    
    // Initialize auth UI after layout is loaded
    const authManager = initAuthUI();
    
    // Store reference for global access
    window.bionixAuth = authManager;

    const initTasks = [];

    // Core UI
    initTasks.push(Promise.resolve(initStickyHeader()));
    initTasks.push(Promise.resolve(initBreadcrumbs()));
    initTasks.push(Promise.resolve(updateMiniCartCount()));

    // Conditional modules
    if (document.querySelector('[data-toggle="quote-modal"]')) {
      initTasks.push(loadQuoteModal());
    }
    if (document.getElementById("carousel-slide")) {
      initTasks.push(initCarousel());
    }
    if (document.getElementById("contactForm")) {
      initTasks.push(initContactForm());
    }
    if (document.getElementById("featured-products-grid")) {
      initTasks.push(initFeaturedProducts());
    }
    if (document.querySelector(".services-grid")) {
      initTasks.push(initServices());
    }
    if (document.getElementById("who-we-are-content")) {
      initTasks.push(initAboutSection());
    }
    if (document.getElementById("newsletter-form")) {
      initTasks.push(initNewsletter());
    }
    if (document.querySelector(".ppe-gallery-section")) {
      initTasks.push(initPPESlider());
    }

    // Animate On Scroll
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }

    console.log(`Executing ${initTasks.length} initialization tasks...`);
    await Promise.all(initTasks);
    console.log("All initialization tasks completed");

    // Mark as fully loaded
    document.body.classList.add('app-loaded');

  } catch (error) {
    console.error("Initialization error:", error);

    // Minimal fallback header & footer
    const header = document.getElementById("header-container");
    const footer = document.getElementById("footer-container");

    if (header && header.innerHTML.trim() === "") {
      header.innerHTML = `
        <header class="default-header">
          <div class="container">
            <a href="${BASE_PATH}" class="logo">BIONIX-EHS</a>
            <nav class="nav-menu">
              <a href="${BASE_PATH}">Home</a>
              <a href="${BASE_PATH}about.html">About</a>
              <a href="${BASE_PATH}contact.html">Contact</a>
            </nav>
          </div>
        </header>`;
    }

    if (footer && footer.innerHTML.trim() === "") {
      footer.innerHTML = `
        <footer class="default-footer">
          <div class="container">
            <p>© ${new Date().getFullYear()} BIONIX-EHS - Environmental Solutions</p>
            <div class="footer-links">
              <a href="${BASE_PATH}">Home</a>
              <a href="${BASE_PATH}about.html">About</a>
              <a href="${BASE_PATH}contact.html">Contact</a>
            </div>
          </div>
        </footer>`;
    }
  }
});

/**
 * Handle tab visibility changes
 */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && window.bionixAuth) {
    // Refresh auth state when tab becomes visible
    setTimeout(() => {
      window.bionixAuth.refresh();
    }, 100);
  }
});

/**
 * Handle page navigation
 */
window.addEventListener("beforeunload", () => {
  // Clean up any pending operations
  if (window.bionixAuth) {
    window.bionixAuth.cleanup();
  }
});

/**
 * Debug Helpers
 */
window.initComponents = {
  carousel: initCarousel,
  contact: initContactForm,
  products: initFeaturedProducts,
  services: initServices,
};

/**
 * Layout Load Check
 */
export const layoutLoaded = (async () => {
  try {
    await loadLayoutComponents();

    const headerOk =
      document.getElementById("header-container")?.innerHTML.trim().length > 0;
    const footerOk =
      document.getElementById("footer-container")?.innerHTML.trim().length > 0;

    if (!headerOk || !footerOk) {
      console.warn("Header or footer not loaded correctly");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Layout loading failed:", err);
    return false;
  }
})();

/**
 * Dynamic Checkout Script
 */
if (window.location.pathname.includes("checkout")) {
  import("./checkout.js")
    .then(() => console.log("checkout.js dynamically loaded"))
    .catch((err) => console.error("Failed to load checkout.js", err));
}

console.log("main.js loaded - Base path:", BASE_PATH);