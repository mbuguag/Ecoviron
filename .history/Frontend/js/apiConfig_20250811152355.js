const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// 👇 Base URL for API endpoints (used for /api/* routes)
export const API_BASE_URL = isLocalDev
  ? "http://localhost:8080/api"
  : "https://your-live-api.com/api";

// 👇 Base URL for serving static content like /uploads/**
export const STATIC_BASE_URL = isLocalDev
  ? "http://localhost:8080"
  : "https://your-live-api.com";

export const BASE_PATH = isLocalDev ? "" : "/";

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
  return BASE_PATH + relativePath;
}

/**
 * Resolves a static asset path (images, icons, etc.) to its full path using BASE_PATH.
 */
export function getAssetPath(relativePath) {
  relativePath = relativePath.replace(/\\/g, "/").replace(/^\//, "");
  if (relativePath.startsWith("http")) {
    return relativePath;
  }
  return BASE_PATH + relativePath;
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
  try {
    const cacheBuster = isLocalDev ? `?t=${new Date().getTime()}` : "";
    const fullUrl = `${url}${cacheBuster}`;
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
      return true;
    }
    console.warn(`Container #${containerId} not found`);
    return false;
  } catch (err) {
    console.error(`Error loading ${url} into #${containerId}:`, err);
    return false;
  }
}
