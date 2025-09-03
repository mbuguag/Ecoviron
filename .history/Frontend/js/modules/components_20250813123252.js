// js/modules/componentLoader.js
import { BASE_PATH, isLocalDev, APP_VERSION, resolvePath } from '../apiConfig';

const COMPONENT_CACHE = new Map();
const LOAD_TIMEOUT = 5000; // 5 seconds

export async function loadComponent(componentPath, containerId, options = {}) {
  const { useCache = true, retries = 2 } = options;
  const cacheKey = `${componentPath}|${containerId}`;

  // Check cache first
  if (useCache && COMPONENT_CACHE.has(cacheKey)) {
    return injectComponent(COMPONENT_CACHE.get(cacheKey), containerId);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT);

    const url = `${resolvePath(componentPath)}${isLocalDev ? `?t=${Date.now()}` : `?v=${APP_VERSION}`}`;
    
    const response = await fetch(url, { 
      signal: controller.signal,
      credentials: 'same-origin'
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let html = await response.text();
    html = processTemplateVariables(html);
    
    if (useCache) COMPONENT_CACHE.set(cacheKey, html);
    
    return injectComponent(html, containerId);
    
  } catch (error) {
    console.error(`Component load error (${componentPath}):`, error);
    
    if (retries > 0) {
      console.log(`Retrying ${componentPath}... (${retries} attempts left)`);
      return loadComponent(componentPath, containerId, { ...options, retries: retries - 1 });
    }
    
    return injectFallback(componentPath, containerId);
  }
}

function processTemplateVariables(html) {
  const vars = {
    'BASE_PATH': BASE_PATH,
    'YEAR': new Date().getFullYear(),
    'APP_NAME': 'BIONIX-EHS'
  };

  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

function injectComponent(html, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return false;
  }

  container.innerHTML = html;
  return true;
}

function injectFallback(componentPath, containerId) {
  const fallbacks = {
    'components/header.html': `
      <header class="fallback-header">
        <div class="container">
          <a href="${BASE_PATH}" class="logo">BIONIX-EHS</a>
          <nav class="nav-menu">
            <a href="${BASE_PATH}">Home</a>
            <a href="${BASE_PATH}about">About</a>
            <a href="${BASE_PATH}contact">Contact</a>
          </nav>
        </div>
      </header>
    `,
    'components/footer.html': `
      <footer class="fallback-footer">
        <div class="container">
          <p>© ${new Date().getFullYear()} BIONIX-EHS. All rights reserved.</p>
        </div>
      </footer>
    `
  };

  const fallbackHtml = fallbacks[componentPath] || '';
  if (fallbackHtml) {
    return injectComponent(fallbackHtml, containerId);
  }
  
  return false;
}