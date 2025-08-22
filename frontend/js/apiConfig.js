/**
 * apiConfig.js
 * Centralized config for API and static asset paths
 */

/**
 * Environment Detection Utilities
 */
export const isLocalDev = 
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.endsWith('.local');

export const isPreviewEnv = 
  window.location.hostname.includes('vercel.app') && 
  !window.location.hostname.startsWith('ecoviron');

// Auto-detect the correct base path for components
function detectComponentsBasePath() {
  // For local development with Live Server (VSCode) running from project root
  if (isLocalDev) {
    // Check if we're in a subdirectory structure
    const currentPath = window.location.pathname;
    
    // If running from project root with frontend/ structure
    if (currentPath.includes('/frontend/')) {
      return '/frontend/components/';
    }
    
    // Default for local development
    return '/components/';
  }
  
  // For production/preview, use absolute paths
  if (isPreviewEnv) {
    return "https://your-preview-domain.vercel.app/components/";
  }
  
  return "https://bionix-hse.co.ke/components/";
}

// Base URLs configuration
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api"
  },
  static: {
    local: "http://localhost:3000",
    preview: "https://your-preview-domain.vercel.app",
    production: "https://bionix-hse.co.ke"
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/"
  }
};

// Create the config object that components.js is expecting
export const config = {
  COMPONENTS_BASE: detectComponentsBasePath()
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
 * Advanced component loader with multiple fallback paths
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  // Priority-ordered candidate paths based on environment
  const candidatePaths = [
    // First try the configured base path
    `${config.COMPONENTS_BASE}${fileName}`,
    
    // Then try absolute paths from root
    `/components/${fileName}`,
    `/frontend/components/${fileName}`,
    
    // Then try relative paths (for different directory structures)
    `./components/${fileName}`,
    `../components/${fileName}`,
    `../../components/${fileName}`,
    
    // Then try origin-based paths
    `${window.location.origin}/components/${fileName}`,
    `${STATIC_BASE_URL}/components/${fileName}`
  ];

  console.log('Trying to load component from paths:', candidatePaths);

  let lastError = null;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    for (const url of candidatePaths) {
      try {
        console.log(`Trying: ${url}`);
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
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
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

// Environment logging
console.log('Environment:', {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
  COMPONENTS_BASE: config.COMPONENTS_BASE
});