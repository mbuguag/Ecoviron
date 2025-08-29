// apiConfig.js

// Detect environment
const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const isPreviewEnv = window.location.hostname.includes("vercel.app");

/**
 * Environment config
 */
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api",
  },
  static: {
    local: "http://localhost:3000",
    preview: "https://your-preview-domain.vercel.app",
    production: "https://www.bionix-hse.co.ke",
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/",
  },
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
    minimumFractionDigits: 2,
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
    ? `${resolvedPath}${
        resolvedPath.includes("?") ? "&" : "?"
      }t=${Date.now()}`
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

// Debug environment info
console.log("Environment:", {
  isLocalDev,
  isPreviewEnv,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
});
