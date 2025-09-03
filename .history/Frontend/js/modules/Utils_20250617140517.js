import { BASE_PATH } from '../apiConfig.js';

export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export async function loadComponent(path, containerId) {
  // No need to modify paths here since we're passing full paths from components.js
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
    return true;
  } catch (error) {
    console.error(`Error loading ${path} into #${containerId}:`, error);
    return false;
  }
}

export function resolvePath(relativePath) {
  const currentPath = window.location.pathname;
  const depth = currentPath.split('/').filter(Boolean).length - 1;
  const prefix = '../'.repeat(depth);
  return prefix + relativePath;
}
