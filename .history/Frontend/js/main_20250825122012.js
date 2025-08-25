// main.js
import { BASE_PATH } from "./apiConfig.js";
import { loadFaviconAndManifest } from "./manifest-loader.js";

import { initCarousel } from "./modules/carousel.js";
import { initContactForm } from "./modules/contact.js";
import { initFeaturedProducts } from "./modules/featured-products.js";
import { initServices } from "./modules/services.js";
import { initAboutSection } from "./modules/about.js";
import { loadLayoutComponents } from "./modules/components.js";
import { updateMiniCartCount } from "./cart-actions.js";
import { loadQuoteModal } from "./modules/quote-modal.js";
import { renderUserDropdown } from "./auth-ui.js";
import { initNewsletter } from "./modules/newsletter.js";
import { initPPESlider } from "./modules/ppe-sliders.js";
import { initBreadcrumbs } from "./modules/breadcrumbs.js";
import { BASE_PATH } from "./apiConfig.js";

/**
 * Sticky Header
 */
function initStickyHeader() {
  const headerEl = document.querySelector(".site-header");
  if (!headerEl) return;

  const stickyClass = "sticky";
  const threshold = 100;

  function toggleSticky() {
    if (window.scrollY > threshold) {
      headerEl.classList.add(stickyClass);
      document.body.classList.add("has-sticky");
    } else {
      headerEl.classList.remove(stickyClass);
      document.body.classList.remove("has-sticky");
    }
  }

  window.addEventListener("scroll", toggleSticky);
  toggleSticky(); // run once on load
}

/**
 * Main App Initialization
 */
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM Content Loaded - Starting initialization...");
  console.log("BASE_PATH:", BASE_PATH);

  try {
    console.log("Loading layout components...");
    await loadLayoutComponents();
    console.log("Layout components loaded successfully");

    renderUserDropdown();
    const initTasks = [];

    // Core UI
    initTasks.push(initStickyHeader());
    initTasks.push(initBreadcrumbs());
    initTasks.push(updateMiniCartCount());

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
      AOS.init();
    }

    console.log(`Executing ${initTasks.length} initialization tasks...`);
    await Promise.all(initTasks);
    console.log("All initialization tasks completed");

  } catch (error) {
    console.error("Initialization error:", error);

    // Minimal fallback header & footer
    const header = document.getElementById("header-container");
    const footer = document.getElementById("footer-container");

    if (header && header.innerHTML.trim() === "") {
      header.innerHTML = `
        <header class="default-header">
          <div class="container">
            <a href="${BASE_PATH}" class="logo">Ecoviron</a>
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
            <p>© ${new Date().getFullYear()} Ecoviron - Environmental Solutions</p>
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
