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
import { BASE_PATH, isLocalDev } from "./apiConfig.js";

// Performance metrics
const perfMetrics = {
  startTime: performance.now(),
  componentsLoaded: 0,
  componentsFailed: 0
};

/**
 * Enhanced Sticky Header with IntersectionObserver
 */
function initStickyHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const stickyClass = "sticky";
  const stickyThreshold = 100;
  let lastScrollY = window.scrollY;

  // More efficient scroll handler with debouncing
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Only proceed if scroll direction changes significantly
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      if (currentScrollY > stickyThreshold) {
        header.classList.add(stickyClass);
        document.body.classList.add("has-sticky");
      } else {
        header.classList.remove(stickyClass);
        document.body.classList.remove("has-sticky");
      }
      lastScrollY = currentScrollY;
    }
  };

  // Use passive scroll listener for better performance
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Initialize based on current position
  if (window.scrollY > stickyThreshold) {
    header.classList.add(stickyClass);
  }
}

/**
 * Loads components with performance tracking
 */
async function loadComponent(componentName, initFn, selector = null) {
  const startTime = performance.now();
  
  try {
    if (selector && !document.querySelector(selector)) {
      console.debug(`Skipping ${componentName} - selector not found`);
      return;
    }

    await initFn();
    perfMetrics.componentsLoaded++;
    console.debug(`${componentName} initialized in ${(performance.now() - startTime).toFixed(2)}ms`);
  } catch (error) {
    perfMetrics.componentsFailed++;
    console.error(`Error initializing ${componentName}:`, error);
    
    // Only show error UI in production
    if (!isLocalDev && selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = `<div class="component-error">
          <p>Component temporarily unavailable</p>
        </div>`;
      }
    }
  }
}

/**
 * Core initialization function
 */
async function initializeApp() {
  console.group("Application Initialization");
  console.log("BASE_PATH:", BASE_PATH);
  
  try {
    // Phase 1: Load critical layout components
    console.time("Layout components");
    await loadLayoutComponents();
    console.timeEnd("Layout components");

    // Phase 2: Initialize essential UI components
    console.time("Core UI components");
    await Promise.all([
      renderUserDropdown(),
      initStickyHeader(),
      initBreadcrumbs(),
      updateMiniCartCount()
    ]);
    console.timeEnd("Core UI components");

    // Phase 3: Load page-specific components
    console.time("Page-specific components");
    const componentInitializers = [
      { name: "Carousel", fn: initCarousel, selector: "#carousel-slide" },
      { name: "Contact Form", fn: initContactForm, selector: "#contactForm" },
      { name: "Featured Products", fn: initFeaturedProducts, selector: "#featured-products-grid" },
      { name: "Services", fn: initServices, selector: ".services-grid" },
      { name: "About Section", fn: initAboutSection, selector: "#who-we-are-content" },
      { name: "Newsletter", fn: initNewsletter, selector: "#newsletter-form" },
      { name: "PPE Slider", fn: initPPESlider, selector: ".ppe-gallery-section" }
    ];

    await Promise.all(componentInitializers.map(comp => 
      loadComponent(comp.name, comp.fn, comp.selector)
    ));

    // Conditional quote modal
    if (document.querySelector('[data-toggle="quote-modal"]')) {
      await loadComponent("Quote Modal", loadQuoteModal);
    }
    console.timeEnd("Page-specific components");

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 600, once: true });
    }

    // Performance summary
    const totalTime = performance.now() - perfMetrics.startTime;
    console.log(`Initialization completed in ${totalTime.toFixed(2)}ms`);
    console.log(`Components: ${perfMetrics.componentsLoaded} loaded, ${perfMetrics.componentsFailed} failed`);
    
  } catch (error) {
    console.error("Critical initialization error:", error);
    showFallbackUI();
  } finally {
    console.groupEnd();
    
    // Send performance metrics in production
    if (!isLocalDev) {
      sendPerformanceMetrics(perfMetrics);
    }
  }
}

/**
 * Minimal fallback UI when critical errors occur
 */
function showFallbackUI() {
  const header = document.getElementById("header-container");
  const footer = document.getElementById("footer-container");

  const minimalHeader = `
    <header class="default-header">
      <div class="container">
        <a href="${BASE_PATH}" class="logo">Ecoviron</a>
        <button class="mobile-menu-toggle">☰</button>
        <nav class="nav-menu">
          <a href="${BASE_PATH}">Home</a>
          <a href="${BASE_PATH}about.html">About</a>
          <a href="${BASE_PATH}contact.html">Contact</a>
        </nav>
      </div>
    </header>
  `;

  const minimalFooter = `
    <footer class="default-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} Ecoviron</p>
        <div class="footer-links">
          <a href="${BASE_PATH}privacy.html">Privacy</a>
          <a href="${BASE_PATH}terms.html">Terms</a>
        </div>
      </div>
    </footer>
  `;

  if (header && header.innerHTML.trim() === "") {
    header.innerHTML = minimalHeader;
  }

  if (footer && footer.innerHTML.trim() === "") {
    footer.innerHTML = minimalFooter;
  }
}

/**
 * Send performance metrics to analytics
 */
function sendPerformanceMetrics(metrics) {
  if (navigator.sendBeacon && window.analytics) {
    const data = {
      ...metrics,
      loadTime: performance.now() - metrics.startTime,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    navigator.sendBeacon(`${API_BASE_URL}/metrics`, JSON.stringify(data));
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Dynamic import for checkout page
if (window.location.pathname.includes("checkout")) {
  import(/* webpackChunkName: "checkout" */ "./checkout.js")
    .then(module => {
      console.log("Checkout module dynamically loaded");
      module.initCheckout();
    })
    .catch(err => {
      console.error("Checkout module failed to load:", err);
      document.getElementById("checkout-form")?.classList.add("error-state");
    });
}

// Debugging exports
if (isLocalDev) {
  window.__DEBUG__ = {
    reloadComponents: () => {
      console.clear();
      window.location.reload();
    },
    perfMetrics,
    BASE_PATH
  };
}