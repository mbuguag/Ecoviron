// js/modules/layoutManager.js
import { loadComponent } from './componentLoader.js';
import { initMobileMenu, initDropdowns } from './uiComponents.js';

const LAYOUT_COMPONENTS = [
  { path: 'components/header.html', container: 'header-container' },
  { path: 'components/footer.html', container: 'footer-container' }
];

let layoutInitialized = false;

export async function initializeLayout() {
  if (layoutInitialized) return true;

  try {
    // Load all layout components
    const results = await Promise.allSettled(
      LAYOUT_COMPONENTS.map(({ path, container }) => 
          loadComponent(path, container)
          
    );

    // Initialize UI components
    _initUIComponents();
    
    layoutInitialized = true;
    return results.every(r => r.status === 'fulfilled' && r.value);
    
  } catch (error) {
    console.error('Layout initialization failed:', error);
    return false;
  }
}

function _initUIComponents() {
  // Small timeout to ensure DOM is ready
  setTimeout(() => {
    initMobileMenu();
    initDropdowns();
    _updateDynamicContent();
  }, 50);
}

function _updateDynamicContent() {
  // Update copyright year
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Mark active navigation items
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.startsWith(linkPath) && linkPath !== '/') {
      link.classList.add('active');
    }
  });
}