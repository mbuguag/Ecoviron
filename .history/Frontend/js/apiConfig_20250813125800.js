// js/apiConfig.js
const isLocalDev = window.location.hostname === "localhost" || 
                   window.location.hostname === "127.0.0.1";

// Deployment configuration
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = isLocalDev 
  ? "http://localhost:8080/api" 
  : "https://ecoviron.vercel.app/api";
export const STATIC_BASE_URL = isLocalDev 
  ? "http://localhost:8080" 
  : "https://ecoviron.vercel.app";
export const BASE_PATH = isLocalDev ? "/frontend/" : "/";

/**
 * Unified path resolution utility
 * Handles both component and asset paths
 */
export function resolvePath(relativePath) {
  // Skip processing for absolute URLs and paths
  if (relativePath.startsWith("http") || relativePath.startsWith("//") || relativePath.startsWith("/")) {
    return relativePath;
  }
  
  // Normalize path and clean up slashes
  const normalizedPath = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
    
  return `${BASE_PATH}${normalizedPath}`.replace(/\/+/g, '/');
}

/**
 * Specialized asset path resolver
 * Prepends 'assets/' to the path if not already present
 */
export function getAssetPath(relativePath) {
  const normalizedPath = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^assets\//, "");
    
  return resolvePath(`assets/${normalizedPath}`);
}

/**
 * Formats a number as KES currency
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Gets a query parameter from URL
 */
export function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

/**
 * Gets multiple query parameters as an object
 */
export function getQueryParams() {
  const params = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}