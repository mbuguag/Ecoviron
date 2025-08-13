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

export async function loadComponent(componentPath, containerId, options = {}) {
  const { useCache = true, retries = 2 } = options;
  const cacheKey = `${componentPath}|${containerId}`;

  // Check cache first
  if (useCache && COMPONENT_CACHE.has(cacheKey)) {
    return _injectComponent(COMPONENT_CACHE.get(cacheKey), containerId);
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
    html = _processTemplate(html);
    
    if (useCache) COMPONENT_CACHE.set(cacheKey, html);
    
    return _injectComponent(html, containerId);
    
  } catch (error) {
    console.error(`Component load error (${componentPath}):`, error);
    
    if (retries > 0) {
      console.log(`Retrying ${componentPath}... (${retries} attempts left)`);
      return loadComponent(componentPath, containerId, { ...options, retries: retries - 1 });
    }
    
    return _loadFallback(componentPath, containerId);
  }
}

function _processTemplate(html) {
  const currentYear = new Date().getFullYear();
  const templateVars = {
    'BASE_PATH': BASE_PATH,
    'YEAR': currentYear,
    'APP_NAME': 'BIONIX-EHS'
  };

  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => templateVars[key] || '');
}

function _injectComponent(html, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return false;
  }

  container.innerHTML = html;
  return true;
}

function _loadFallback(componentPath, containerId) {
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
    return _injectComponent(fallbackHtml, containerId);
  }
  
  return false;
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