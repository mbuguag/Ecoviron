/**
 * Layout Component Manager
 * Loads and initializes header/footer with fallbacks
 */

import {
  BASE_PATH,
  getAssetPath,
  loadComponents
} from "../apiConfig.js";

// Layout state
const layoutState = {
  initialized: false,
  headerLoaded: false,
  footerLoaded: false
};

// Cache DOM elements
const domCache = {
  header: null,
  footer: null
};

/**
 * Load header and footer components
 */
export async function loadLayoutComponents() {
  if (layoutState.initialized) return true;

  domCache.header = document.getElementById("header-container");
  domCache.footer = document.getElementById("footer-container");

  try {
    const results = await loadComponents([
      { fileName: "header.html", containerId: "header-container" },
      { fileName: "footer.html", containerId: "footer-container" }
    ]);

    layoutState.headerLoaded = results["header.html"];
    layoutState.footerLoaded = results["footer.html"];

    if (!layoutState.headerLoaded) loadFallbackHeader();
    if (!layoutState.footerLoaded) loadFallbackFooter();

    initSharedFeatures();
    layoutState.initialized = true;
    return true;
  } catch (err) {
    console.error("Layout loading failed, using fallbacks", err);
    loadFallbackHeader();
    loadFallbackFooter();
    initSharedFeatures();
    return false;
  }
}

/**
 * Initialize shared layout features
 */
function initSharedFeatures() {
  updateCopyright();
  initLazyLoading();
}

/**
 * Lazy loading (images, sources)
 */
function initLazyLoading() {
  const lazyItems = document.querySelectorAll("[data-src], [data-srcset]");
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute("data-src");
        }
        if (el.dataset.srcset) {
          el.srcset = el.dataset.srcset;
          el.removeAttribute("data-srcset");
        }
        observer.unobserve(el);
      }
    });
  });

  lazyItems.forEach(el => observer.observe(el));
}

/**
 * Update copyright year
 */
function updateCopyright() {
  const year = new Date().getFullYear();
  document
    .querySelectorAll("[data-current-year]")
    .forEach(el => (el.textContent = year));
}

/**
 * Fallback header
 */
function loadFallbackHeader() {
  if (!domCache.header) return;
  domCache.header.innerHTML = `
    <header class="fallback-header">
      <a href="${BASE_PATH}">
        <img src="${getAssetPath("assets/icons/Bionix logo.jpg")}" 
             alt="Logo" width="60" height="60">
      </a>
      <button class="mobile-menu-toggle" aria-expanded="false">☰</button>
      <nav class="nav-menu">
        <a href="${BASE_PATH}index.html">Home</a>
        <a href="${BASE_PATH}about.html">About</a>
        <a href="${BASE_PATH}services/services.html">Services</a>
        <a href="${BASE_PATH}blog/blog.html">Blog</a>
        <a href="${BASE_PATH}contact.html">Contact</a>
        <a href="${BASE_PATH}ecommerce/product-grid.html">Shop</a>
      </nav>
    </header>`;
}

/**
 * Fallback footer
 */
function loadFallbackFooter() {
  if (!domCache.footer) return;
  const year = new Date().getFullYear();
  domCache.footer.innerHTML = `
    <footer class="fallback-footer">
      <p>© ${year} BIONIX-EHS. All rights reserved.</p>
    </footer>`;
}

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", loadLayoutComponents);
