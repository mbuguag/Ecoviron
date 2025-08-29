// main.js
import { BASE_PATH } from "./apiConfig.js";
import { initLayoutFeatures } from "./modules/components.js"; // ✅ new
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

/**
 * Main App Initialization
 */
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM Content Loaded - Starting initialization...");
  console.log("BASE_PATH:", BASE_PATH);

  // ✅ Initialize layout (sticky header, nav clone, smooth scroll, lazy load, etc.)
  initLayoutFeatures();

  // Continue with app init
  renderUserDropdown();
  const initTasks = [];

  // Core UI
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
