const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isPreviewEnv = window.location.hostname.includes("preview") || window.location.hostname.includes("staging");

const BASE_PATH = isLocalDev ? "/" : "/";
const API_BASE_URL = isLocalDev ? "http://localhost:8080/api" : "/api";
const STATIC_BASE_URL = isLocalDev ? "http://localhost:3000" : "https://www.bionix-hse.co.ke/";

const COMPONENTS_BASE = `${BASE_PATH}components/`; // 🔑 central place for header/footer

export const config = {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
  COMPONENTS_BASE
};

console.log("Environment:", config);


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
 * Advanced component loader with auto root detection
 */
export async function loadComponent(fileName, containerId, retries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return false;
  }

  // 🔑 Dynamic candidate paths (prioritized by environment)
  const candidatePaths = isLocalDev
    ? [
        `./components/${fileName}`,                        // relative (local dev)
        `${window.location.origin}/components/${fileName}`, // absolute root
        `${BASE_PATH}components/${fileName}`                // basePath-aware
      ]
    : [
        `${STATIC_BASE_URL}/components/${fileName}`,        // prod/preferred
        `${window.location.origin}/components/${fileName}`, // fallback
        `${BASE_PATH}components/${fileName}`,               // basePath-aware
        `./components/${fileName}`                          // relative last
      ];

  let html = null;
  let lastTried = null;

  for (const url of candidatePaths) {
    try {
      lastTried = url;
      const res = await fetch(url, { cache: isLocalDev ? "no-store" : "default" });
      if (!res.ok) {
        console.warn(`[loadComponent] ${fileName} not at ${url} (${res.status})`);
        continue;
      }
      html = await res.text();
      break;
    } catch (err) {
      console.warn(`[loadComponent] fetch failed for ${url}`, err);
      continue;
    }
  }

  if (!html) {
    console.error(`❌ All candidate paths failed for ${fileName}. Last tried: ${lastTried}`);

    if (!isLocalDev) {
      container.innerHTML = `
        <div class="component-error">
          <p>⚠️ ${fileName} failed to load. Please refresh the page.</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
    return false;
  }

  // Replace placeholders like ${BASE_PATH}
  html = html.replace(/\${BASE_PATH}/g, BASE_PATH);

  container.innerHTML = html;
  return true;
}



// Environment logging
console.log('Environment:', {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL
});