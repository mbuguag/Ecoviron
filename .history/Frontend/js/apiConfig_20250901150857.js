// ==================
// apiConfig.js
// ==================

// Detect environment
const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const isPreviewEnv = window.location.hostname.includes("vercel.app");

/**
 * Detect base path for loading components (header, footer, etc.)
 */
function detectComponentsBasePath() {
  if (isLocalDev) {
    return window.location.pathname.includes("/frontend/")
      ? "/frontend/components/"
      : "/components/";
  }
  if (isPreviewEnv) return "https://your-preview-domain.vercel.app/components/";
  return "https://www.bionix-hse.co.ke/components/";
}

// Env config
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

// Exports
export const config = { COMPONENTS_BASE: detectComponentsBasePath() };

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
 * Helpers
 */
export function formatPrice(amount, currency = "KES") {
  if (isNaN(amount)) return `${currency} 0.00`;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;
  if (/^(http|\/\/)/.test(relativePath)) return relativePath;
  if (relativePath.startsWith("/")) {
    return `${BASE_PATH}${relativePath.slice(1)}`.replace(/\/+/g, "/");
  }
  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, "/");
}

export function getAssetPath(relativePath, bustCache = false) {
  const cleanPath = relativePath.replace(/^\/+/, "");
  const resolvedPath = resolvePath(cleanPath);
  return bustCache
    ? `${resolvedPath}${resolvedPath.includes("?") ? "&" : "?"}t=${Date.now()}`
    : resolvedPath;
}

export function getQueryParam(key, defaultValue = null) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Component loader (cache-first + skeleton fallback)
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  const CACHE_KEY = `component_cache_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 10; // 10 min
  let hasContent = false;

  // 1️⃣ Cache-first render
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      container.innerHTML = cached.html;
      hasContent = true;
      console.log(`⚡ Using cached ${fileName}`);
    }
  } catch {}

  // 2️⃣ Skeleton fallback
  if (!hasContent) {
    container.innerHTML = `
      <div class="skeleton skeleton-${fileName.replace(".html", "")}">
        Loading ${fileName}...
      </div>`;
  }

  // 3️⃣ Try fetching fresh version
  const candidatePaths = [
    `${config.COMPONENTS_BASE}${fileName}`,
    `/frontend/components/${fileName}`,
    `./components/${fileName}`,
    `../components/${fileName}`,
    `${STATIC_BASE_URL}/components/${fileName}`
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

        if (!response.ok) continue;

        let html = await response.text();
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);

        if (!hasContent || container.innerHTML !== html) {
          container.innerHTML = html; // ✅ silent refresh if changed
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify({ html, timestamp: Date.now() }));
        console.log(`✅ Loaded ${fileName} from ${url}`);
        return true;
      } catch (err) {
        lastError = err;
      }
    }
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 5000)));
    }
  }

  console.error(`❌ Failed to load ${fileName}:`, lastError);
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
 * Batch loader
 */
export async function loadComponents(components) {
  const results = await Promise.allSettled(
    components.map(({ fileName, containerId }) =>
      loadComponent(fileName, containerId).then(success => ({ fileName, success }))
    )
  );

  const summary = {};
  results.forEach((res, i) => {
    const { fileName } = components[i];
    summary[fileName] = res.status === "fulfilled" ? res.value.success : false;
  });

  console.log("Batch component load summary:", summary);
  return summary;
}

// Debug environment
console.log("Environment:", { isLocalDev, isPreviewEnv, BASE_PATH, API_BASE_URL, STATIC_BASE_URL, COMPONENTS_BASE: config.COMPONENTS_BASE });
