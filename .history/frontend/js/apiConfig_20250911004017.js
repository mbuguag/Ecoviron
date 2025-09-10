// Detect environment
import { loadComponent, loadComponents, loadLayoutComponents } from "./modules/components.js";

const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isVercelPreview = window.location.hostname.includes("vercel.app");
const isProduction = !isLocalDev && !isVercelPreview;

const DEBUG = isLocalDev; 

/**
 * Environment config with better domain handling
 */
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api"
  },
  static: {
    local: "http://localhost:3000",
    preview: window.location.origin, // Use current Vercel preview URL
    production: "https://www.bionix-hse.co.ke"
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/"
  }
};

/**
 * Environment-specific URLs with better detection
 */
export const API_BASE_URL = isLocalDev
  ? ENV_CONFIG.api.local
  : isVercelPreview
    ? ENV_CONFIG.api.preview
    : ENV_CONFIG.api.production;

export const STATIC_BASE_URL = isLocalDev
  ? ENV_CONFIG.static.local
  : isVercelPreview
    ? ENV_CONFIG.static.preview
    : ENV_CONFIG.static.production;

export const BASE_PATH = "/"; // Always use root path for static assets

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
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Resolve relative paths against base path - Fixed for Vercel deployment
 */
export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;

  // Handle absolute URLs
  if (relativePath.startsWith("http") || relativePath.startsWith("//")) {
    return relativePath;
  }

  // Handle root-relative paths  
  if (relativePath.startsWith("/")) {
    return relativePath; // Return as-is for Vercel routing
  }

  // Handle relative paths
  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, "/");
}

/**
 * Asset resolver with better path handling for Vercel
 */
export function getAssetPath(relativePath, bustCache = false) {
  if (!relativePath) return BASE_PATH;
  
  const cleanPath = relativePath.replace(/^\/+/, "");
  let resolvedPath;
  
  if (isLocalDev) {
    resolvedPath = `/${cleanPath}`;
  } else {
    // For production/Vercel, use absolute paths
    resolvedPath = `/${cleanPath}`;
  }

  return bustCache
    ? `${resolvedPath}${resolvedPath.includes("?") ? "&" : "?"}t=${Date.now()}`
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
  isVercelPreview,
  isProduction,
  hostname: window.location.hostname,
  BASE_PATH,
  API_BASE_URL,
  STATIC_BASE_URL,
  origin: window.location.origin
});