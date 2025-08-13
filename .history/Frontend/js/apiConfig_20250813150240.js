
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

// 👇 CRITICAL: Adjust based on your Vercel deployment structure
export const BASE_PATH = isLocalDev ? "/frontend/" : "/";

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
  if (relativePath.startsWith("http") || relativePath.startsWith("/")) return relativePath;
  return (BASE_PATH + relativePath).replace(/\/+/g, '/');
}

/**
 * Resolve assets like images/icons
 */
export function getAssetPath(relativePath) {
  return resolvePath(relativePath.replace(/^\/+/, ""));
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
  const url = resolvePath(relativePath); // ensures correct path
  try {
    const cacheBuster = window.location.hostname.includes('localhost') ? `?t=${Date.now()}` : '';
    const res = await fetch(`${url}${cacheBuster}`);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
    return !!container;
  } catch (err) {
    console.error(`Error loading ${relativePath} into #${containerId}:`, err);
    return false;
  }
}