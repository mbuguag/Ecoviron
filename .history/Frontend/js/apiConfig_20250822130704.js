/**
 * apiConfig.js
 * Centralized config for API and static asset paths
 */

// --- Environment Detection ---
const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// --- Auto-detect Base Path ---
function detectBasePath() {
  // Check for <base> tag in HTML
  const baseTag = document.querySelector("base[href]");
  if (baseTag) {
    try {
      const url = new URL(baseTag.getAttribute("href"), window.location.origin);
      return url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
    } catch (e) {
      console.warn("⚠️ Invalid <base> href in document:", baseTag.getAttribute("href"));
    }
  }

  // If hosted in a subdirectory like /frontend/, /preview/, /staging/
  const match = window.location.pathname.match(/^\/(frontend|preview|staging)\//);
  if (match) {
    return `/${match[1]}/`;
  }

  // Default fallback → root
  return "/";
}

const BASE_PATH = detectBasePath();

// --- API + Static URLs ---
const API_BASE_URL = isLocalDev
  ? "http://localhost:8080/api"
  : `${BASE_PATH}api`;

const STATIC_BASE_URL = isLocalDev
  ? "http://localhost:3000"
  : "https://www.bionix-hse.co.ke";


// --- Bulk Component Loader --

// --- Exports ---
export {
  isLocalDev,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
};


// Named exports for backward compatibility
export { isLocalDev, BASE_PATH, STATIC_BASE_URL };

/**
 * Enhanced currency formatting with validation
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: KES)
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'KES') {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    console.warn('Invalid amount provided to formatPrice:', amount);
    return `${currency} 0.00`;
  }
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

/**
 * Robust path resolution with validation
 * @param {string} relativePath - Path to resolve
 * @returns {string} Resolved absolute path
 */
export function resolvePath(relativePath) {
  if (!relativePath) {
    console.error('resolvePath called with empty path');
    return BASE_PATH;
  }

  // Return absolute URLs as-is
  if (relativePath.startsWith('http') || relativePath.startsWith('//')) {
    return relativePath;
  }

  // Clean up path separators and resolve
  const cleanPath = relativePath.replace(/^\/+/, '');
  return `${BASE_PATH}${cleanPath}`.replace(/\/+/g, '/');
}

/**
 * Asset path resolver with optional cache busting
 * @param {string} relativePath - Relative path to asset
 * @param {boolean} bustCache - Whether to add cache busting parameter
 * @returns {string} Complete asset URL
 */
export function getAssetPath(relativePath, bustCache = false) {
  const resolvedPath = resolvePath(relativePath);
  
  if (bustCache) {
    const separator = resolvedPath.includes('?') ? '&' : '?';
    return `${resolvedPath}${separator}t=${Date.now()}`;
  }
  
  return resolvedPath;
}

/**
 * Safe query parameter extraction
 * @param {string} key - Parameter name to extract
 * @param {*} defaultValue - Default value if parameter not found
 * @returns {string|null} Parameter value or default
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
 * Advanced component loader with multiple fallback paths
 * @param {string} fileName - Component file name (e.g., 'header.html')
 * @param {string} containerId - Target container element ID
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<boolean>} Success status
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  // Priority-ordered candidate paths based on environment
  const candidatePaths = isLocalDev
    ? [
        `./components/${fileName}`,
        `${window.location.origin}/components/${fileName}`,
        `${config.COMPONENTS_BASE}${fileName}`
      ]
    : [
        `${STATIC_BASE_URL}/components/${fileName}`,
        `${window.location.origin}/components/${fileName}`,
        `${config.COMPONENTS_BASE}${fileName}`,
        `./components/${fileName}`
      ];

  let lastError = null;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    for (const url of candidatePaths) {
      try {
        const response = await fetch(url, { 
          cache: isLocalDev ? "no-store" : "default",
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        if (!response.ok) {
          console.warn(`[loadComponent] ${fileName} not found at ${url} (${response.status})`);
          continue;
        }

        let html = await response.text();
        
        // Replace template variables
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);
        
        container.innerHTML = html;
        console.log(`✅ Successfully loaded ${fileName} from ${url}`);
        return true;

      } catch (err) {
        console.warn(`[loadComponent] Fetch failed for ${url}:`, err.message);
        lastError = err;
      }
    }

    retryCount++;
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff, max 5s
      console.log(`Retrying ${fileName} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  console.error(`❌ Failed to load ${fileName} after ${maxRetries} attempts. Last error:`, lastError);
  
  // Show user-friendly error message
  if (!isLocalDev) {
    container.innerHTML = `
      <div class="component-error" style="
        padding: 1rem;
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid rgba(220, 53, 69, 0.3);
        border-radius: 4px;
        color: #721c24;
        text-align: center;
        margin: 0.5rem 0;
      ">
        <p>⚠️ ${fileName.replace('.html', '')} component failed to load.</p>
        <button onclick="window.location.reload()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }
  
  return false;
}

/**
 * Batch component loader for multiple components
 * @param {Array} components - Array of {fileName, containerId} objects
 * @returns {Promise<Object>} Results object with success/failure status per component
 */
export async function loadComponents(components) {
  if (!Array.isArray(components) || components.length === 0) {
    console.warn('loadComponents called with invalid components array');
    return {};
  }

  const results = await Promise.allSettled(
    components.map(({ fileName, containerId }) => 
      loadComponent(fileName, containerId).then(success => ({ fileName, containerId, success }))
    )
  );

  const summary = {};
  results.forEach((result, index) => {
    const { fileName } = components[index];
    if (result.status === 'fulfilled') {
      summary[fileName] = result.value.success;
    } else {
      summary[fileName] = false;
      console.error(`Component loading promise rejected for ${fileName}:`, result.reason);
    }
  });

  console.log('Batch component loading summary:', summary);
  return summary;
}

// Environment logging (only in development)
if (isLocalDev) {
  console.log('🔧 Development Environment Config:', {
    isLocalDev,
    isPreviewEnv,
    BASE_PATH,
    API_BASE_URL,
    STATIC_BASE_URL,
    COMPONENTS_BASE: config.COMPONENTS_BASE
  });
}