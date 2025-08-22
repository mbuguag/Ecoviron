/**
 * Environment Detection Utilities
 */
const isLocalDev = 
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.endsWith('.local');

const isPreviewEnv = 
  window.location.hostname.includes('vercel.app') && 
  !window.location.hostname.startsWith('ecoviron');

// Base URLs configuration
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",   // keep for vercel preview deploys
    production: "https://api.bionix-hse.co.ke/api"  // use your custom domain
  },
  static: {
    local: "http://localhost:3000", // or wherever Vercel dev runs
    preview: "https://your-preview-domain.vercel.app",
    production: "https://bionix-hse.co.ke"
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/"
  }
};


/**
 * Get environment-specific base URL for API endpoints
 */
export const API_BASE_URL = (() => {
  if (isLocalDev) return ENV_CONFIG.api.local;
  if (isPreviewEnv) return ENV_CONFIG.api.preview;
  return ENV_CONFIG.api.production;
})();

/**
 * Get environment-specific base URL for static assets
 */
export const STATIC_BASE_URL = (() => {
  if (isLocalDev) return ENV_CONFIG.static.local;
  if (isPreviewEnv) return ENV_CONFIG.static.preview;
  return ENV_CONFIG.static.production;
})();

/**
 * Get environment-specific base path
 */
export const BASE_PATH = (() => {
  if (isLocalDev) return ENV_CONFIG.basePath.local;
  if (isPreviewEnv) return ENV_CONFIG.basePath.preview;
  return ENV_CONFIG.basePath.production;
})();

/**
 * Enhanced currency formatting
 */
export function formatPrice(amount, currency = 'KES') {
  if (isNaN(amount)) {
    console.warn('Invalid amount provided to formatPrice:', amount);
    return `${currency} 0`;
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Robust path resolution with validation
 */
export function resolvePath(relativePath) {
  if (!relativePath) {
    console.error('resolvePath called with empty path');
    return BASE_PATH;
  }

  if (relativePath.startsWith('http') || relativePath.startsWith('//')) {
    return relativePath;
  }

  if (relativePath.startsWith('/')) {
    return `${BASE_PATH}${relativePath.substring(1)}`.replace(/\/+/g, '/');
  }

  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, '/');
}

/**
 * Asset path resolver with cache busting
 */
export function getAssetPath(relativePath, bustCache = false) {
  const cleanPath = relativePath.replace(/^\/+/, '');
  const resolvedPath = resolvePath(cleanPath);
  
  return bustCache 
    ? `${resolvedPath}${resolvedPath.includes('?') ? '&' : '?'}t=${Date.now()}`
    : resolvedPath;
}

/**
 * Comprehensive query parameter handling
 */
export function getQueryParam(key, defaultValue = null) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) ?? defaultValue;
  } catch (err) {
    console.error('Error parsing query params:', err);
    return defaultValue;
  }
}

/**
 * Advanced component loader with auto root detection
 */
/**
 * Load an HTML component into a container with auto path resolution
 */
export async function loadComponent(relativePath, containerId, retries = 3) {
  try {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container #${containerId} not found`);

    // Candidate paths (works for local dev & production)
    const candidatePaths = [
      `${window.location.origin}/components${relativePath}`,          // prod (Vercel, root deploy)
      `${window.location.origin}/frontend/components/${relativePath}`, // local (Live Server)
      `./components/${relativePath}`,                                 // relative fallback
    ];

    let html = null;
    let tried = [];

    for (const url of candidatePaths) {
      tried.push(url);
      try {
        const res = await fetch(url, { cache: isLocalDev ? "no-store": "default" });
        if (!res.ok) continue;
        html = await res.text();
        break;
      } catch {
        continue;
      }
    }

    if (!html) throw new Error(`All paths failed for ${relativePath}. Tried: ${tried.join(", ")}`);

    // Replace placeholders like ${BASE_PATH}
    html = html.replace(/\${BASE_PATH}/g, BASE_PATH);

    container.innerHTML = html;
    return true;

  } catch (err) {
    console.error(`Failed to load ${relativePath}:`, err);

    if (!isLocalDev && containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="component-error">
            <p>Component failed to load. Please refresh the page.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        `;
      }
    }
    return false;
  }
}


// Environment logging
console.log('Environment:', {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL
});