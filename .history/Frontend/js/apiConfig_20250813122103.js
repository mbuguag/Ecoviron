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

// Path resolution utilities
export function resolvePath(relativePath) {
  if (relativePath.startsWith("http") || relativePath.startsWith("//")) {
    return relativePath;
  }
  return `${BASE_PATH}${relativePath.replace(/^\/+/, "")}`.replace(/\/+/g, '/');
}

export function getAssetPath(relativePath) {
  return resolvePath(`assets/${relativePath}`);
}

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
 * Dynamically loads a component (e.g. header, footer) into a container by ID.
 */
// export async function loadComponent(relativePath, containerId) {
//   const url = resolvePath(relativePath);
//   try {
//     const cacheBuster = isLocalDev ? `?t=${new Date().getTime()}` : "";
//     const fullUrl = `${url}${cacheBuster}`;
    
//     console.log(`🔍 Attempting to load: ${fullUrl}`);
    
//     const res = await fetch(fullUrl);
//     if (!res.ok) {
//       throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
//     }
    
//     const html = await res.text();
//     const container = document.getElementById(containerId);
    
//     if (container) {
//       container.innerHTML = html;
//       console.log(`✅ Successfully loaded ${relativePath} into #${containerId}`);
//       return true;
//     }
    
//     console.warn(`⚠️ Container #${containerId} not found`);
//     return false;
    
//   } catch (err) {
//     console.error(`❌ Error loading ${url} into #${containerId}:`, err);
//     return false;
//   }
// }