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

export async function loadComponent(relativePath, containerId) {
  try {
    // Resolve path first
    let url = resolvePath(relativePath);
    
    // Add cache buster for development
    const cacheBuster = isLocalDev ? `?t=${Date.now()}` : '';
    
    const res = await fetch(`${url}${cacheBuster}`);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    
    let html = await res.text();
    const container = document.getElementById(containerId);
    
    if (container) {
      // Process BASE_PATH template literals
      html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
      container.innerHTML = html;
    }
    
    return !!container;
  } catch (err) {
    console.error(`Error loading ${relativePath} into #${containerId}:`, err);
    return false;
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