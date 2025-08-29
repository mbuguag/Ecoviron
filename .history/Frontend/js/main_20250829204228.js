// main.js
import { BASE_PATH } from "./apiConfig.js";
import { initCarousel } from "./modules/carousel.js";
import { initContactForm } from "./modules/contact.js";
import { initFeaturedProducts } from "./modules/featured-products.js";
import { initServices } from "./modules/services.js";
import { initAboutSection } from "./modules/about.js";
import { updateMiniCartCount } from "./cart-actions.js";
import { loadQuoteModal } from "./modules/quote-modal.js";
import { renderUserDropdown } from "./auth-ui.js";
import { initNewsletter } from "./modules/newsletter.js";
import { initPPESlider } from "./modules/ppe-sliders.js";
import { initBreadcrumbs } from "./modules/breadcrumbs.js";
// import { initHeaderMenu } from "./modules/header-menu.js";


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

  // Initialize user dropdown (auth area in header)
  renderUserDropdown();

  const initTasks = [];

  // Core UI
  initTasks.push(initStickyHeader());
  initTasks.push(initBreadcrumbs());
  initTasks.push(updateMiniCartCount());
   initTasks.push(initHeaderMenu());

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

console.log("main.js loaded - Base path:", BASE_PATH);
