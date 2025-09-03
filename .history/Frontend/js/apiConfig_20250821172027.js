// Environment Detection
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

// Environment-specific URLs
export const API_BASE_URL = (() => {
  if (isLocalDev) return ENV_CONFIG.api.local;
  if (isPreviewEnv) return ENV_CONFIG.api.preview;
  return ENV_CONFIG.api.production;
})();

export const STATIC_BASE_URL = (() => {
  if (isLocalDev) return ENV_CONFIG.static.local;
  if (isPreviewEnv) return ENV_CONFIG.static.preview;
  return ENV_CONFIG.static.production;
})();

export const BASE_PATH = (() => {
  if (isLocalDev) return ENV_CONFIG.basePath.local;
  if (isPreviewEnv) return ENV_CONFIG.basePath.preview;
  return ENV_CONFIG.basePath.production;
})();

// Utility functions
export function formatPrice(amount, currency = 'KES') {
  if (isNaN(amount)) return `${currency} 0`;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;
  if (relativePath.startsWith('http') || relativePath.startsWith('//')) {
    return relativePath;
  }
  if (relativePath.startsWith('/')) {
    return `${BASE_PATH}${relativePath.substring(1)}`.replace(/\/+/g, '/');
  }
  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, '/');
}

export function getAssetPath(relativePath, bustCache = false) {
  const cleanPath = relativePath.replace(/^\/+/, '');
  const resolvedPath = resolvePath(cleanPath);
  return bustCache 
    ? `${resolvedPath}${resolvedPath.includes('?') ? '&' : '?'}t=${Date.now()}`
    : resolvedPath;
}

export function getQueryParam(key, defaultValue = null) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) ?? defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

export async function loadComponent(relativePath, containerId, retries = 3) {
  try {
    const url = getAssetPath(relativePath, isLocalDev);
    const container = document.getElementById(containerId);

    if (!container) throw new Error(`Container #${containerId} not found`);

    const load = async (attempt) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
      } catch (err) {
        if (attempt <= retries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          return load(attempt + 1);
        }
        throw err;
      }
    };

    let html = await load(1);
    html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
    container.innerHTML = html;
    return true;
  } catch (err) {
    console.error(`Failed to load ${relativePath}:`, err);
    return false;
  }
}

// Environment logging
console.log('Environment:', { isLocalDev, isPreviewEnv, BASE_PATH, API_BASE_URL, STATIC_BASE_URL });