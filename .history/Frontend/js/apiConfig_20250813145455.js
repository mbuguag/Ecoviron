const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// 👇 Base URL for API endpoints (used for /api/* routes)
export const API_BASE_URL = isLocalDev
  ? "http://localhost:8080/api"
  : "https://ecoviron.vercel.app/api";

// 👇 Base URL for serving static content like /uploads/**
export const STATIC_BASE_URL = isLocalDev
  ? "http://localhost:8080"
  : "https://ecoviron.vercel.app";

// 👇 CRITICAL: Adjust based on your deployment structure
// For Live Server on port 5500, we typically don't need /frontend/ prefix
export const BASE_PATH = isLocalDev ? "/" : "/";

// Debug logging
console.log('Environment Detection:', {
  isLocalDev,
  hostname: window.location.hostname,
  BASE_PATH,
  currentURL: window.location.href
});

/**
 * Formats a number as KES currency.
 */
export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

/**
 * Resolves a relative component path into a fully qualified URL using BASE_PATH.
 */
export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;
  
  // If already absolute, return as-is
  if (relativePath.startsWith("http") || relativePath.startsWith("//")) {
    return relativePath;
  }
  
  // If starts with /, treat as absolute path from domain root
  if (relativePath.startsWith("/")) {
    return relativePath;
  }
  
  // Remove leading slashes from relativePath and BASE_PATH for clean joining
  const cleanRelativePath = relativePath.replace(/^\/+/, "");
  const cleanBasePath = BASE_PATH.replace(/\/+$/, "");
  
  // Join paths and normalize multiple slashes
  const result = (cleanBasePath + "/" + cleanRelativePath).replace(/\/+/g, '/');
  
  // Ensure leading slash for absolute paths
  return result.startsWith('/') ? result : '/' + result;
}

/**
 * Resolve assets like images/icons - same as resolvePath but with clearer naming
 */
export function getAssetPath(relativePath) {
  return resolvePath(relativePath);
}

/**
 * Parses a query parameter from the URL.
 */
export function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

/**
 * Dynamically loads a component (e.g. header, footer) into a container by ID.
 */
export async function loadComponent(relativePath, containerId) {
  const url = resolvePath(relativePath);
  
  console.log(`Loading component: ${relativePath} -> ${url}`);
  
  try {
    // Add cache buster for local development
    const cacheBuster = isLocalDev ? `?t=${Date.now()}` : '';
    const fullUrl = `${url}${cacheBuster}`;
    
    console.log(`Fetching: ${fullUrl}`);
    
    const res = await fetch(fullUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const html = await res.text();
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Container #${containerId} not found in DOM`);
      return false;
    }
    
    container.innerHTML = html;
    console.log(`Successfully loaded ${relativePath} into #${containerId}`);
    return true;
    
  } catch (err) {
    console.error(`Error loading ${relativePath} into #${containerId}:`, {
      error: err.message,
      resolvedUrl: url,
      containerId
    });
    return false;
  }
}

/**
 * Gets the current page name from the URL
 */
export function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename || 'index.html';
}

/**
 * Checks if we're on a specific page
 */
export function isCurrentPage(pageName) {
  return getCurrentPage().toLowerCase() === pageName.toLowerCase();
}

/**
 * Debug function to check path resolution
 */
export function debugPaths() {
  console.log('=== PATH DEBUG INFO ===');
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
  console.log('Pathname:', window.location.pathname);
  console.log('isLocalDev:', isLocalDev);
  console.log('BASE_PATH:', BASE_PATH);
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('STATIC_BASE_URL:', STATIC_BASE_URL);
  console.log('');
  console.log('Sample path resolutions:');
  console.log('  "index.html" ->', resolvePath('index.html'));
  console.log('  "about.html" ->', resolvePath('about.html'));
  console.log('  "services/services.html" ->', resolvePath('services/services.html'));
  console.log('  "assets/icons/logo.jpg" ->', getAssetPath('assets/icons/logo.jpg'));
  console.log('  "components/header.html" ->', resolvePath('components/header.html'));
  console.log('=======================');
}