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
import { BASE_PATH } from "./apiConfig.js";
import { initializeLayout } from './modules/layoutManager.js';

// Sticky Header Functionality
function initStickyHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const stickyThreshold = 100;
  const stickyClass = "sticky";

  const handleScroll = () => {
    if (window.scrollY > stickyThreshold) {
      header.classList.add(stickyClass);
      document.body.classList.add("has-sticky");
    } else {
      header.classList.remove(stickyClass);
      document.body.classList.remove("has-sticky");
    }
  };

  // Initialize based on current scroll position
  handleScroll();
  
  // Add scroll event listener
  window.addEventListener("scroll", handleScroll);
}

// Fallback content for critical components
function loadFallbackLayout() {
  const header = document.getElementById("header-container");
  const footer = document.getElementById("footer-container");

  if (header && !header.innerHTML.trim()) {
    header.innerHTML = `
      <header class="default-header">
        <div class="container">
          <a href="${BASE_PATH}" class="logo">BIONIX-EHS</a>
          <nav class="nav-menu">
            <a href="${BASE_PATH}">Home</a>
            <a href="${BASE_PATH}about">About</a>
            <a href="${BASE_PATH}contact">Contact</a>
          </nav>
        </div>
      </header>
    `;
  }

  if (footer && !footer.innerHTML.trim()) {
    footer.innerHTML = `
      <footer class="default-footer">
        <div class="container">
          <p>© ${new Date().getFullYear()} BIONIX-EHS - Environmental Solutions</p>
          <div class="footer-links">
            <a href="${BASE_PATH}">Home</a>
            <a href="${BASE_PATH}about">About</a>
            <a href="${BASE_PATH}contact">Contact</a>
          </div>
        </div>
      </footer>
    `;
  }
}

// Initialize page-specific components
async function initPageComponents() {
  const initTasks = [];

  // Initialize sticky header if header exists
  initTasks.push(initStickyHeader());
  initTasks.push(initBreadcrumbs());

  // Only load quote modal if the trigger exists
  if (document.querySelector('[data-toggle="quote-modal"]')) {
    initTasks.push(loadQuoteModal());
  }

  // Conditional modules based on page content
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

  // Always update cart badge count
  initTasks.push(updateMiniCartCount());

  // Initialize AOS if available
  if (typeof AOS !== 'undefined') {
    AOS.init();
  }

  try {
    console.log(`Executing ${initTasks.length} initialization tasks...`);
    await Promise.all(initTasks);
    console.log("All initialization tasks completed");
  } catch (error) {
    console.error("Error initializing page components:", error);
  }
}

// Main initialization flow
async function initializeApplication() {
  console.log("Starting application initialization...");
  console.log("BASE_PATH:", BASE_PATH);

  try {
    // Phase 1: Load critical layout components
    console.log("Loading layout components...");
    const layoutSuccess = await initializeLayout();
    
    if (!layoutSuccess) {
      console.warn("Layout loading completed with warnings");
      loadFallbackLayout();
    }

    // Phase 2: Initialize authentication UI
    renderUserDropdown();

    // Phase 3: Load page-specific components
    await initPageComponents();

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Application initialization failed:", error);
    loadFallbackLayout();
  }
}

// Start initialization when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeApplication().then(() => {
    document.documentElement.classList.add('app-loaded');
  });
});

// Dynamic import for checkout page
if (window.location.pathname.includes("checkout")) {
  import("./checkout.js")
    .then(() => console.log("checkout.js dynamically loaded"))
    .catch((err) => console.error("Failed to load checkout.js", err));
}

// Optional: expose component initializers globally for debugging
// if (process.env.NODE_ENV === 'development') {
//   window.initComponents = {
//     carousel: initCarousel,
//     contact: initContactForm,
//     products: initFeaturedProducts,
//     services: initServices,
//   };
// }

console.log("Main.js loaded - Base path:", BASE_PATH);