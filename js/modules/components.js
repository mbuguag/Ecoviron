/**
 * Layout Component Manager
 * Handles header/footer loading, retries, caching, fallbacks, and initialization
 */

import { BASE_PATH, getAssetPath } from "../apiConfig.js";

const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
  
// Layout state
const layoutState = {
  initialized: false,
  headerLoaded: false,
  footerLoaded: false,
};

// Cache DOM elements
const domCache = {
  header: null,
  footer: null,
};

/**
 * Load a single component with caching + retries
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  const CACHE_KEY = `component_cache_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes
  let lastError = null;

  // Serve from cache first
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      container.innerHTML = cached.html;
      console.log(`💾 Loaded ${fileName} from cache`);
      return true;
    }
  } catch (err) {
    console.warn(`[cache] Parse error for ${fileName}:`, err);
  }

  // Candidate fetch paths
  const candidatePaths = [
    `${BASE_PATH}components/${fileName}`,
    `/frontend/components/${fileName}`,
    `./components/${fileName}`,
    `../components/${fileName}`,
  ];

  // Retry logic
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of candidatePaths) {
      try {
        console.log(`[loadComponent] Trying: ${url}`);
        const response = await fetch(url, { headers: { Accept: "text/html" } });
        if (!response.ok) {
          console.warn(
            `[loadComponent] ${fileName} not found at ${url} (${response.status})`
          );
          continue;
        }

        let html = await response.text();
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
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

  return false;
}

/**
 * Load multiple components
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

  return summary;
}

/**
 * Load layout (header + footer) with fallbacks
 */
export async function loadLayoutComponents() {
  if (layoutState.initialized) return true;

  domCache.header = document.getElementById("header-container");
  domCache.footer = document.getElementById("footer-container");

  const results = await loadComponents([
    { fileName: "header.html", containerId: "header-container" },
    { fileName: "footer.html", containerId: "footer-container" },
  ]);

  layoutState.headerLoaded = results["header.html"];
  layoutState.footerLoaded = results["footer.html"];

  if (!layoutState.headerLoaded) loadFallbackHeader();
  if (!layoutState.footerLoaded) loadFallbackFooter();

  initHeader();
  layoutState.initialized = true;
  return results;
}

/**
 * Header-specific features
 */
function initHeader() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
      document.body.classList.toggle("menu-open", navMenu.classList.contains("active"));
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
        <img src="${getAssetPath("assets/icons/Bionix logo.jpg")}" alt="Logo" width="60" height="60">
      </a>
      <button class="nav-toggle" aria-expanded="false">☰</button>
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
document.addEventListener("DOMContentLoaded", loadLayoutComponents);
