// Detect environment
const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isPreviewEnv = window.location.hostname.includes("vercel.app");

/**
 * Detect base path for loading components (header, footer, etc.)
 */
function detectComponentsBasePath() {
  if (isLocalDev) {
    // Local dev can be run either at /frontend/ or directly at root
    if (window.location.pathname.includes("/frontend/")) {
      return "/frontend/components/";
    }
    return "/components/";
  }

  if (isPreviewEnv) {
    return "https://your-preview-domain.vercel.app/components/";
  }

  // ✅ Always use canonical www domain in production
  return "https://www.bionix-hse.co.ke/components/";
}

/**
 * Environment config
 */
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api"
  },
  static: {
    local: "http://localhost:3000",
    preview: "https://your-preview-domain.vercel.app",
    production: "https://www.bionix-hse.co.ke"
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/"
  }
};

// Exported config
export const config = {
  COMPONENTS_BASE: detectComponentsBasePath()
};

/**
 * Environment-specific URLs
 */
export const API_BASE_URL = isLocalDev
  ? ENV_CONFIG.api.local
  : isPreviewEnv
    ? ENV_CONFIG.api.preview
    : ENV_CONFIG.api.production;

export const STATIC_BASE_URL = isLocalDev
  ? ENV_CONFIG.static.local
  : isPreviewEnv
    ? ENV_CONFIG.static.preview
    : ENV_CONFIG.static.production;

export const BASE_PATH = isLocalDev
  ? ENV_CONFIG.basePath.local
  : isPreviewEnv
    ? ENV_CONFIG.basePath.preview
    : ENV_CONFIG.basePath.production;

/**
 * Format price with currency
 */
export function formatPrice(amount, currency = "KES") {
  if (isNaN(amount)) {
    console.warn("Invalid amount for formatPrice:", amount);
    return `${currency} 0.00`;
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Resolve relative paths against base path
 */
export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;

  if (relativePath.startsWith("http") || relativePath.startsWith("//")) {
    return relativePath;
  }

  if (relativePath.startsWith("/")) {
    return `${BASE_PATH}${relativePath.substring(1)}`.replace(/\/+/g, "/");
  }

  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, "/");
}

/**
 * Asset resolver (with optional cache-busting)
 */
export function getAssetPath(relativePath, bustCache = false) {
  const cleanPath = relativePath.replace(/^\/+/, "");
  const resolvedPath = resolvePath(cleanPath);

  return bustCache
    ? `${resolvedPath}${resolvedPath.includes("?") ? "&" : "?"}t=${Date.now()}`
    : resolvedPath;
}

/**
 * Get query parameters safely
 */
export function getQueryParam(key, defaultValue = null) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) ?? defaultValue;
  } catch (err) {
    console.error("Error parsing query params:", err);
    return defaultValue;
  }
}


/**
 * Load a single component into a container with cache-first strategy + skeleton fallback
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  const CACHE_KEY = `component_cache_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes

  let hasContent = false;

  // 1️⃣ Try cached version first (instant render, no flicker)
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
      container.innerHTML = cached.html;
      hasContent = true;
      console.log(`⚡ Using cached ${fileName}`);
    }
  } catch (err) {
    console.warn(`[cache] Parse error for ${fileName}:`, err);
  }

  // 2️⃣ If no cache, show a skeleton loader
  if (!hasContent) {
    container.innerHTML = `
      <div class="skeleton skeleton-${fileName.replace('.html', '')}">
        Loading ${fileName}...
      </div>
    `;
  }

  // 3️⃣ Candidate paths to try
  const candidatePaths = [
    `${config.COMPONENTS_BASE}${fileName}`,     // main path
    `/frontend/components/${fileName}`,        // dev fallback
    `./components/${fileName}`,                // relative fallback
    `../components/${fileName}`,               // relative fallback
    `${STATIC_BASE_URL}/components/${fileName}` // absolute static
  ];

  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of candidatePaths) {
      try {
        console.log(`[loadComponent] Trying: ${url}`);
        const response = await fetch(url, {
          cache: isLocalDev ? "no-store" : "default",
          headers: { Accept: "text/html" }
        });

        if (!response.ok) {
          console.warn(`[loadComponent] ${fileName} not found at ${url} (${response.status})`);
          continue;
        }

        let html = await response.text();
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);

        // ✅ Only update DOM if different (avoid flicker)
        if (!hasContent || container.innerHTML !== html) {
          container.innerHTML = html;
        }

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          html,
          timestamp: Date.now()
        }));

        console.log(`✅ Loaded ${fileName} from ${url}`);
        return true;
      } catch (err) {
        console.warn(`[loadComponent] Fetch failed for ${url}:`, err.message);
        lastError = err;
      }
    }

    // exponential backoff retry
    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`Retrying ${fileName} in ${delay}ms (attempt ${attempt + 2}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`❌ Failed to load ${fileName} after ${maxRetries} retries. Last error:`, lastError);

  if (!isLocalDev && !hasContent) {
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
      loadComponent(fileName, containerId).then(success => ({ fileName, success }))
    )
  );

  const summary = {};
  results.forEach((res, i) => {
    const { fileName } = components[i];
    summary[fileName] = res.status === "fulfilled" ? res.value.success : false;
    if (res.status === "rejected") {
      console.error(`[loadComponents] Failed for ${fileName}:`, res.reason);
    }
  });

  console.log("Batch component load summary:", summary);
  return summary;
}

// Debug environment info
console.log("Environment:", {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
  COMPONENTS_BASE: config.COMPONENTS_BASE
});
