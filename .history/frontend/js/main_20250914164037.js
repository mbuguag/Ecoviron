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
  if (initialized) return;
  initialized = true;

  console.log("DOM Content Loaded - Starting initialization...");
  console.log("BASE_PATH:", BASE_PATH);

  try {
    // 1. Load layout components (header + footer)
    console.log("Loading layout components...");
    await loadLayoutComponents();

    const headerMounted =
      document.querySelector("#header-container")?.children.length > 0;
    const footerMounted =
      document.querySelector("#footer-container")?.children.length > 0;

    if (!headerMounted || !footerMounted) {
      throw new Error("Header or footer failed to mount");
    }

    console.log("✅ Layout components mounted successfully");

    // 2. Init header & auth UI after layout is ready
    initHeader();

    window.authUIInitialized = true;
    const authManager = initAuthUI();
    window.bionixAuth = authManager;

    // 3. Other initialization tasks
    const initTasks = [
      Promise.resolve(initStickyHeader()),
      Promise.resolve(initBreadcrumbs()),
      Promise.resolve(updateMiniCartCount()),
    ];

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
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }

    console.log(`Executing ${initTasks.length} initialization tasks...`);
    await Promise.allSettled(initTasks);
    console.log("✅ All initialization tasks completed");

    document.body.classList.add("app-loaded");
  } catch (error) {
    console.error("Initialization error:", error);

    // 4. Fallback header & footer
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
    setTimeout(() => {
      window.bionixAuth.refresh();
    }, 100);
  }
});

/**
 * Handle page navigation
 */
window.addEventListener("beforeunload", () => {
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
 * Layout Load Check (can be imported by others if needed)
 */
export const layoutLoaded = (async () => {
  try {
    await loadLayoutComponents();
    const headerOk =
      document.getElementById("header-container")?.innerHTML.trim().length > 0;
    const footerOk =
      document.getElementById("footer-container")?.innerHTML.trim().length > 0;
    return headerOk && footerOk;
  } catch (err) {
    console.error("Layout loading failed:", err);
    return false;
  }
})();

/**
 * Dynamic Checkout Script
 */
if (window.location.pathname.includes("checkout")) {
  import("../js/checkout.js")
    .then(({ initCheckout }) => {
      if (!localStorage.getItem("jwtToken")) {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/auth/login.html";
      } else {
        initCheckout(); // only runs if authenticated
      }
    })
    .catch((err) => console.error("Failed to load checkout.js", err));
}


console.log("main.js loaded - Base path:", BASE_PATH);
