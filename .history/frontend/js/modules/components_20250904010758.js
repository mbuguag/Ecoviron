/**
 * Layout Component Manager
 * Loads and initializes header/footer with fallbacks
 */

import {
  BASE_PATH,
  getAssetPath,
  loadComponents
} from '../apiConfig.js';

// Layout state
const layoutState = {
  initialized: false,
  headerLoaded: false,
  footerLoaded: false
};

// Cache DOM elements
const domCache = {
  header: null,
  footer: null,
  menuToggle: null,
  navMenu: null
};

/**
 * Load header and footer components
 */
export async function loadLayoutComponents() {
  if (layoutState.initialized) return true;

  domCache.header = document.getElementById('header-container');
  domCache.footer = document.getElementById('footer-container');

  try {
    const results = await loadComponents([
      { fileName: 'header.html', containerId: 'header-container' },
      { fileName: 'footer.html', containerId: 'footer-container' }
    ]);

    layoutState.headerLoaded = results['header.html'];
    layoutState.footerLoaded = results['footer.html'];

    if (!layoutState.headerLoaded) loadFallbackHeader();
    if (!layoutState.footerLoaded) loadFallbackFooter();

    initFeatures();
    layoutState.initialized = true;
    return true;

  } catch (err) {
    console.error('Layout loading failed, using fallbacks', err);
    loadFallbackHeader();
    loadFallbackFooter();
    initFeatures();
    return false;
  }
}

/**
 * Initialize layout features
 */
function initFeatures() {
  cacheInteractiveElements();
  initMobileMenu();
  updateCopyright();
  initSmoothScroll();
  initLazyLoading();
}

/**
 * Cache interactive elements
 */
function cacheInteractiveElements() {
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  if (!domCache.menuToggle || !domCache.navMenu) return;

  domCache.menuToggle.addEventListener('click', () => {
    const active = domCache.navMenu.classList.toggle('active');
    domCache.menuToggle.classList.toggle('active', active);
    document.body.classList.toggle('menu-open', active);
    domCache.menuToggle.setAttribute('aria-expanded', active);
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      domCache.navMenu?.classList.remove('active');
      domCache.menuToggle?.classList.remove('active');
    }
  });
}

/**
 * Lazy loading
 */
function initLazyLoading() {
  const lazyItems = document.querySelectorAll('[data-src], [data-srcset]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        }
        if (el.dataset.srcset) {
          el.srcset = el.dataset.srcset;
          el.removeAttribute('data-srcset');
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
  document.querySelectorAll('[data-current-year]')
    .forEach(el => el.textContent = year);
}

export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  const CACHE_KEY = `component_cache_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes

  // Try cached version first
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      container.innerHTML = cached.html;
    }
  } catch (err) {
    console.warn(`[cache] Parse error for ${fileName}:`, err);
  }

  const candidatePaths = [
    `${config.COMPONENTS_BASE}${fileName}`,
    `/frontend/components/${fileName}`,
    `./components/${fileName}`,
    `../components/${fileName}`,
    `${STATIC_BASE_URL}/components/${fileName}`,
  ];

  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of candidatePaths) {
      try {
        console.log(`[loadComponent] Trying: ${url}`);
        const response = await fetch(url, {
          cache: isLocalDev ? "no-store" : "default",
          headers: { Accept: "text/html" },
        });

        if (!response.ok) {
          console.warn(
            `[loadComponent] ${fileName} not found at ${url} (${response.status})`
          );
          continue;
        }

        let html = await response.text();
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);

        container.innerHTML = html;

        // Save to cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ html, timestamp: Date.now() })
        );

        console.log(`✅ Loaded ${fileName} from ${url}`);
        return true;
      } catch (err) {
        console.warn(`[loadComponent] Fetch failed for ${url}:`, err.message);
        lastError = err;
      }
    }

    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(
        `Retrying ${fileName} in ${delay}ms (attempt ${attempt + 2}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error(
    `❌ Failed to load ${fileName} after ${maxRetries} retries. Last error:`,
    lastError
  );

  if (!isLocalDev) {
    container.innerHTML = `
      <div class="component-error">
        ⚠️ ${fileName.replace(".html", "")} failed to load.
        <button onclick="window.location.reload()">Retry</button>
      </div>`;
  }

  return false;
}

/**
 * Load multiple components at once
 */
export async function loadComponents(components) {
  if (!Array.isArray(components) || components.length === 0) return {};

  const results = await Promise.allSettled(
    components.map(({ fileName, containerId }) =>
      loadComponent(fileName, containerId).then((success) => ({
        fileName,
        success,
      }))
    )
  );

  const summary = {};
  results.forEach((res, i) => {
    const { fileName } = components[i];
    summary[fileName] =
      res.status === "fulfilled" ? res.value.success : false;
    if (res.status === "rejected") {
      console.error(`[loadComponents] Failed for ${fileName}:`, res.reason);
    }
  });

  console.log("Batch component load summary:", summary);
  return summary;
}

/**
 * Load header + footer + shared UI components
 */
export async function loadLayoutComponents() {
  try {
    const results = await loadComponents([
      { fileName: "header.html", containerId: "header-container" },
      { fileName: "footer.html", containerId: "footer-container" },
    ]);

    if (!results["header.html"] || !results["footer.html"]) {
      console.warn("Some layout components failed to load.");
    }

    // Initialize header scripts (toggle, mobile nav, etc.)
    initHeader();

    return results;
  } catch (err) {
    console.error("Layout loading failed, using fallbacks", err);
    throw err;
  }
}

/**
 * Header-specific behavior (mobile toggle, dropdowns, etc.)
 */
function initHeader() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  console.log("✅ Header initialized");
}


/**
 * Fallback header
 */

function loadFallbackHeader() {
  if (!domCache.header) return;
  domCache.header.innerHTML = `
    <header class="fallback-header">
      <a href="${BASE_PATH}">
        <img src="${getAssetPath('assets/icons/Bionix logo.jpg')}" 
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

// Auto-init
document.addEventListener('DOMContentLoaded', loadLayoutComponents);
