// js/modules/layoutManager.js
import { loadComponent } from './componentLoader.js';
import { initMobileMenu, initDropdowns } from './uiComponents.js';

const LAYOUT_CONFIG = [
  { path: 'components/header.html', container: 'header-container' },
  { path: 'components/footer.html', container: 'footer-container' }
];

let layoutInitialized = false;

export async function initializeLayout() {
  if (layoutInitialized) return true;

  try {
    const results = await Promise.allSettled(
      LAYOUT_CONFIG.map(({ path, container }) => 
        loadComponent(path, container))
    );

    // Initialize UI components
    initLayoutComponents();
    
    layoutInitialized = true;
    return results.every(r => r.status === 'fulfilled' && r.value);
    
  } catch (error) {
    console.error('Layout initialization failed:', error);
    return false;
  }
}

function initLayoutComponents() {
  setTimeout(() => {
    initMobileMenu();
    initDropdowns();
    updateDynamicContent();
  }, 50);
}

function updateDynamicContent() {
  // Update copyright year
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Mark active nav links
  const currentPath = window.location.pathname.replace(BASE_PATH, '');
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const linkPath = link.getAttribute('href').replace(BASE_PATH, '');
    if (currentPath.startsWith(linkPath) && linkPath !== '') {
      link.classList.add('active');
    }
  });
}