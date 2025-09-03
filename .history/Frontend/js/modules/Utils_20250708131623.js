import { BASE_PATH } from "./jsapiConfig.js";

const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

/**
 * Formats a number as KES currency.
 */
export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

/**
 * Loads a component (like header/footer) into the specified container by ID.
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
