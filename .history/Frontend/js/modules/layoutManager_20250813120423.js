// src/core/layoutManager.js
import { loadComponent } from './componentLoader.js';
import { initMobileMenu } from './uiComponents.js';

let layoutInitialized = false;

export async function initializeLayout() {
  if (layoutInitialized) return true;
  
  try {
    const [headerLoaded, footerLoaded] = await Promise.all([
      loadComponent('header', 'header-container'),
      loadComponent('footer', 'footer-container')
    ]);

    // Initialize UI components after short delay
    setTimeout(() => {
      initMobileMenu();
      updateDynamicContent();
    }, 50);

    layoutInitialized = true;
    return headerLoaded && footerLoaded;
  } catch (error) {
    console.error('Layout initialization failed:', error);
    return false;
  }
}

function updateDynamicContent() {
  // Update copyright year
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Other dynamic content updates
}