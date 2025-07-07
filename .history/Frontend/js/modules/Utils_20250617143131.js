import { BASE_PATH } from '../apiConfig.js';

export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export async function loadComponent(relativePath, containerId) {
  const url = resolvePath(relativePath);
  
  try {
    // Add cache buster for development
    const cacheBuster = isLocalDev ? `?t=${new Date().getTime()}` : '';
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

export function resolvePath(relativePath) {
  // If path is already absolute, return as-is
  if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // For components, always use BASE_PATH
  if (relativePath.includes('components/')) {
    return `${BASE_PATH}${relativePath}`;
  }
  
  // For other relative paths, calculate based on current location
  const currentPath = window.location.pathname;
  const depth = currentPath.split('/').filter(Boolean).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : './';
  return prefix + relativePath;
}