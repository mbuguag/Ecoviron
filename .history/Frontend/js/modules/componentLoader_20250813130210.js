// src/core/componentLoader.js
import { 
  BASE_PATH, 
  isLocalDev, 
  APP_VERSION, 
  resolvePath 
} from '../apiConfig.js';

// Cache for loaded components
const componentCache = new Map();
const LOAD_TIMEOUT = 5000; 

export async function loadComponent(componentName, containerId) {
  // Check cache first
  if (componentCache.has(componentName)) {
    return injectComponent(componentCache.get(componentName), containerId);
  }

  try {
    const url = `${BASE_PATH}components/${componentName}.html?${isLocalDev ? `t=${Date.now()}` : `v=${APP_VERSION}`}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    componentCache.set(componentName, html);
    return injectComponent(html, containerId);
  } catch (error) {
    console.error(`Failed to load ${componentName}:`, error);
    injectFallback(componentName, containerId);
    return false;
  }
}

function injectComponent(html, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return false;
  }

  // Process template variables
  const processedHtml = html
    .replace(/\{\{BASE_PATH\}\}/g, BASE_PATH)
    .replace(/\{\{YEAR\}\}/g, new Date().getFullYear());

  container.innerHTML = processedHtml;
  return true;
}

function injectFallback(componentName, containerId) {
  const fallbacks = {
    header: `
      <header class="fallback-header">
        <a href="${BASE_PATH}">Home</a>
        <nav>
          <a href="${BASE_PATH}about">About</a>
          <a href="${BASE_PATH}contact">Contact</a>
        </nav>
      </header>
    `,
    footer: `
      <footer class="fallback-footer">
        <p>© ${new Date().getFullYear()} ${document.title}</p>
      </footer>
    `
  };

  if (fallbacks[componentName]) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = fallbacks[componentName];
    }
  }
}