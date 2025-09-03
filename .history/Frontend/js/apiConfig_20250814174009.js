/**
 * Environment Configuration for BIONIX-HSE
 * Supports: Local, Preview, Vercel, and Custom Domains
 */

// Domain Configuration
const DOMAINS = {
  LOCAL: 'localhost',
  PREVIEW: 'vercel.app',
  PRODUCTION: 'ecoviron.vercel.app'
};

// Environment Detection
const isLocalDev = 
  window.location.hostname === DOMAINS.LOCAL ||
  window.location.hostname === '127.0.0.1';

const isPreviewEnv = 
  window.location.hostname.includes(DOMAINS.PREVIEW) && 
  !window.location.hostname.startsWith('ecoviron');

const isProduction = 
  window.location.hostname === DOMAINS.PRODUCTION;

// Base Configuration
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: `https://${window.location.hostname}/api`,
    production: `https://${DOMAINS.PRODUCTION}/api`
  },
  static: {
    local: "http://localhost:8080",
    preview: `https://${window.location.hostname}`,
    production: `https://${DOMAINS.PRODUCTION}`
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
export const BASE_PATH = (() => {
  if (isLocalDev) return ENV_CONFIG.basePath.local;
  if (isPreviewEnv) return ENV_CONFIG.basePath.preview;
  return ENV_CONFIG.basePath.production;
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
 * Get environment-specific component base URL
 */
export const COMPONENT_BASE_URL = (() => {
  if (isLocalDev) return ENV_CONFIG.components.local;
  if (isPreviewEnv) return ENV_CONFIG.components.preview;
  return ENV_CONFIG.components.production;
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
 * Advanced component loader with retry mechanism and enhanced error handling
 */
export async function loadComponent(relativePath, containerId, options = {}) {
  const {
    retries = 3,
    cacheBust = isLocalDev,
    fallback = true
  } = options;

  try {
    const url = cacheBust 
      ? `${COMPONENT_BASE_URL}${relativePath}?v=${Date.now()}`
      : `${COMPONENT_BASE_URL}${relativePath}`;

    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`Container #${containerId} not found`);
    }

    const loadWithRetry = async (attempt = 1) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      } catch (err) {
        if (attempt <= retries) {
          console.warn(`Retry ${attempt} for ${url}`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
          return loadWithRetry(attempt + 1);
        }
        throw err;
      }
    };

    let html = await loadWithRetry();
    html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
    container.innerHTML = html;

    return true;
  } catch (err) {
    console.error(`Failed to load ${relativePath}:`, err);
    
    if (fallback && !isLocalDev && containerId) {
      return loadFallbackComponent(containerId, relativePath);
    }
    
    return false;
  }
}

/**
 * Fallback component loader
 */
function loadFallbackComponent(containerId, componentName) {
  const container = document.getElementById(containerId);
  if (!container) return false;

  const fallbacks = {
    'header.html': `
      <header class="fallback-header">
        <div class="container">
          <a href="${BASE_PATH}" class="logo">BIONIX-HSE</a>
          <nav>
            <a href="${BASE_PATH}">Home</a>
            <a href="${BASE_PATH}about.html">About</a>
            <a href="${BASE_PATH}services.html">Services</a>
          </nav>
        </div>
      </header>
    `,
    'footer.html': `
      <footer class="fallback-footer">
        <div class="container">
          <p>© ${new Date().getFullYear()} BIONIX-HSE. All rights reserved.</p>
        </div>
      </footer>
    `
  };

  container.innerHTML = fallbacks[componentName] || `
    <div class="component-error">
      <p>Component ${componentName} failed to load</p>
      <button onclick="window.location.reload()">Retry</button>
    </div>
  `;

  return true;
}

// Environment logging
console.log('Environment Configuration:', {
  hostname: window.location.hostname,
  isLocalDev,
  isPreviewEnv,
  isStaging,
  isProduction,
  isVercelProd,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
  COMPONENT_BASE_URL
});

// Export environment detection for debugging
export const Environment = {
  isLocalDev,
  isPreviewEnv,
  isStaging,
  isProduction,
  isVercelProd,
  currentDomain: window.location.hostname
};