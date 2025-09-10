/**
 * Layout Component Manager (patched)
 * - Executes scripts inside injected HTML (header/footer)
 * - Dispatches lifecycle events: `component:loaded`, `header:mounted`, `footer:mounted`
 * - Plays nicely with cached components
 * - Prevents "glitch" by hiding containers until content is ready
 */

import { BASE_PATH, getAssetPath } from "../apiConfig.js";

const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const layoutState = {
  initialized: false,
  headerLoaded: false,
  footerLoaded: false,
};

const domCache = {
  header: null,
  footer: null,
};

/* ---------------------------
   Helpers: script activation
---------------------------- */

/**
 * Re-insert <script> tags so they execute after innerHTML injection.
 * Supports both inline and external scripts.
 */
function activateScripts(container) {
  if (!container) return;
  const scripts = container.querySelectorAll("script");
  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");
    [...oldScript.attributes].forEach((a) =>
      newScript.setAttribute(a.name, a.value)
    );
    if (!newScript.type) newScript.type = oldScript.type || "text/javascript";
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    oldScript.replaceWith(newScript);
  });
}

/**
 * Fire a custom event with optional payload
 */
function emit(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/* ---------------------------
   Core loader with better path resolution
---------------------------- */

export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  const CACHE_KEY = `component_cache_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes
  let lastError = null;

  // Try cache first
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      let html = cached.html;
      container.innerHTML = html;
      activateScripts(container);

      container.classList.add("loaded"); // reveal

      emit("component:loaded", { fileName, fromCache: true, containerId });
      if (fileName === "header.html") emit("header:mounted", { fromCache: true });
      if (fileName === "footer.html") emit("footer:mounted", { fromCache: true });
      console.log(`💾 Loaded ${fileName} from cache`);
      return true;
    }
  } catch (err) {
    console.warn(`[cache] Parse error for ${fileName}:`, err);
  }

  // Updated candidate paths with better environment detection
  const candidatePaths = [];
  
  if (isLocalDev) {
    // Local development paths
    candidatePaths.push(
      `${BASE_PATH}components/${fileName}`,
      `/frontend/components/${fileName}`,
      `./components/${fileName}`,
      `../components/${fileName}`
    );
  } else {
    // Production/Vercel paths
    candidatePaths.push(
      `/components/${fileName}`,
      `${BASE_PATH}components/${fileName}`,
      `./components/${fileName}`
    );
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of candidatePaths) {
      try {
        console.log(`[loadComponent] Trying: ${url}`);
        const response = await fetch(url, {
          headers: { 
            Accept: "text/html",
            "Cache-Control": isLocalDev ? "no-cache" : "default"
          },
          cache: isLocalDev ? "no-store" : "default",
        });
        
        if (!response.ok) {
          console.warn(
            `[loadComponent] ${fileName} not found at ${url} (${response.status})`
          );
          continue;
        }

        let html = await response.text();
        
        // Replace placeholders with actual paths
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        
        // Fix relative CSS/JS paths in the loaded HTML
        html = html.replace(
          /href=["'](?!http|\/\/|#)([^"']+\.css)["']/g,
          `href="${BASE_PATH}$1"`
        );
        html = html.replace(
          /src=["'](?!http|\/\/|#)([^"']+\.js)["']/g,
          `src="${BASE_PATH}$1"`
        );

        container.innerHTML = html;
        activateScripts(container);

        container.classList.add("loaded"); // reveal

        // Cache successful response
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ html, timestamp: Date.now() })
          );
        } catch (cacheErr) {
          console.warn(`[cache] Failed to cache ${fileName}:`, cacheErr);
        }

        emit("component:loaded", { fileName, fromCache: false, containerId });
        if (fileName === "header.html") emit("header:mounted", { fromCache: false });
        if (fileName === "footer.html") emit("footer:mounted", { fromCache: false });

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
    if (res.status === "rejected")
      console.error(`[loadComponents] Failed for ${fileName}:`, res.reason);
  });

  return summary;
}

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

  layoutState.initialized = true;
  return results;
}

/* ---------------------------
   Fallbacks
---------------------------- */

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
  domCache.header.classList.add("loaded");
  emit("header:mounted", { fallback: true });
}

function loadFallbackFooter() {
  if (!domCache.footer) return;
  const year = new Date().getFullYear();
  domCache.footer.innerHTML = `
    <footer class="fallback-footer">
      <p>© ${year} BIONIX-EHS. All rights reserved.</p>
    </footer>`;
  domCache.footer.classList.add("loaded");
  emit("footer:mounted", { fallback: true });
}

// Auto-init
document.addEventListener("DOMContentLoaded", loadLayoutComponents);