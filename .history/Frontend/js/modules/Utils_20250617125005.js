export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export async function loadComponent(url, containerId) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);

    const html = await res.text();
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
      return true;
    } else {
      console.warn(`Container with id ${containerId} not found.`);
      return false;
    }
  } catch (err) {
    console.error(`Error loading ${url} into #${containerId}:`, err);
    return false;
  }
}

export function resolvePath(relativePath) {
  const 
  const depth = window.location.pathname.split('/').length - 2; // root + filename
  const prefix = '../'.repeat(depth);
  return `${prefix}${relativePath}`;
}