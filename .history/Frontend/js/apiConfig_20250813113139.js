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

// 👇 IMPORTANT: Set this based on your actual deployment structure
export const BASE_PATH = isLocalDev 
  ? "/frontend/" 
  : "/"; // or whatever your production path is

  
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
  if (relativePath.startsWith("/") || relativePath.startsWith("http")) {
    return relativePath;
  }
  // Clean up double slashes
  const path = (BASE_PATH + relativePath).replace(/\/+/g, '/');
  return path;
}

/**
 * Resolves a static asset path (images, icons, etc.) to its full path using BASE_PATH.
 */
export function getAssetPath(relativePath) {
  relativePath = relativePath.replace(/\\/g, "/").replace(/^\//, "");
  if (relativePath.startsWith("http")) {
    return relativePath;
  }
  const path = (BASE_PATH + relativePath).replace(/\/+/g, '/');
  return path;
}

/**
 * Parses a query parameter from the URL.
 */
export function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}
/**
 * Dynamically loads a component into a specified container with robust error handling
 * @param {string} relativePath - Path to component relative to BASE_PATH
 * @param {string} containerId - ID of container element to insert component
 * @param {object} [options] - Optional configuration
 * @param {boolean} [options.allowFallback=true] - Whether to load fallback on failure
 * @param {boolean} [options.retry=false] - Whether to attempt retry on failure
 * @param {number} [options.retryDelay=1000] - Delay between retries in ms
 * @returns {Promise<boolean>} - Whether loading succeeded
 */
export async function loadComponent(
  relativePath, 
  containerId, 
  { allowFallback = true, retry = false, retryDelay = 1000 } = {}
) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  
  // Define APP_VERSION at build time (e.g., from package.json or CI/CD)
  const APP_VERSION = process.env.APP_VERSION || '1.0.0';

  const load = async () => {
    attempt++;
    try {
      const url = resolvePath(relativePath);
      
      // Cache busting strategy
      const cacheBuster = isLocalDev 
        ? `?t=${Date.now()}` // Dev: timestamp
        : `?v=${APP_VERSION}`; // Prod: version-based
      
      console.log(`Loading component [attempt ${attempt}]: ${url}`);

      const res = await fetch(`${url}${cacheBuster}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }

      const html = await res.text();
      const container = document.getElementById(containerId);
      
      if (!container) {
        throw new Error(`Container #${containerId} not found`);
      }

      container.innerHTML = html;
      console.log(`Successfully loaded ${relativePath}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to load ${relativePath}:`, error.message);
      
      // Production error reporting
      if (!isLocalDev) {
        logErrorToService({
          type: 'COMPONENT_LOAD_FAILURE',
          path: relativePath,
          container: containerId,
          error: error.message,
          attempt,
          timestamp: new Date().toISOString()
        });
      }
      
      throw error; // Re-throw for retry logic
    }
  };

  // Attempt to load with retry logic
  while (attempt < (retry ? MAX_RETRIES : 1)) {
    try {
      return await load();
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // Final fallback if all attempts fail
      if (allowFallback) {
        console.warn('Loading fallback component');
        return loadFallbackComponent(containerId, relativePath);
      }
      
      return false;
    }
  }
}

/**
 * Fallback component loader
 */
function loadFallbackComponent(containerId, componentName = '') {
  const container = document.getElementById(containerId);
  if (!container) return false;
  
  container.innerHTML = `
    <div class="component-error">
      <p>Failed to load ${componentName || 'component'}</p>
      ${!isLocalDev ? '<p>Our team has been notified</p>' : ''}
    </div>
  `;
  
  return true;
}

/**
 * Production error logging (example implementation)
 */
function logErrorToService(errorData) {
  if (typeof window !== 'undefined' && window.analytics) {
    // Example: Log to analytics service
    window.analytics.track('component_load_error', errorData);
  }
  
  // Alternatively, send to error tracking service
  fetch(`${API_BASE_URL}/error-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  }).catch(e => console.error('Failed to log error:', e));
}