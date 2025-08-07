import { initCarousel } from './modules/carousel.js';
import { initContactForm } from './modules/contact.js';
import { initFeaturedProducts } from './modules/featured-products.js';
import { initServices } from './modules/services.js';
import { loadComponent, resolvePath } from './modules/utils.js';


function loadComponent(url, containerId) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      return res.text();
    })
    .then(data => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = data;
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}


function resolvePath(relativePath) {
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  if (window.location.hostname === '127.0.0.1') {
    return '/Frontend/' + relativePath;
  }

  return '/' + relativePath;
}

window.addEventListener('DOMContentLoaded', () => {
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container')
;
// Initialize all components and page modules
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load essential components first
    await Promise.all([
      loadComponent(resolvePath('components/header.html'), 'header-container'),
      loadComponent(resolvePath('components/footer.html'), 'footer-container')
    ]);

    // Initialize page-specific modules after components load
    const initTasks = [];
    
    if (document.getElementById('carousel-slide')) {
      initTasks.push(initCarousel());
    }
    
    if (document.getElementById('contactForm')) {
      initTasks.push(initContactForm());
    }
    
    if (document.getElementById('featured-products-grid')) {
      initTasks.push(initFeaturedProducts());
    }
    
    if (document.querySelector('.services-grid')) {
      initTasks.push(initServices());
    }

    await Promise.all(initTasks);
    
  } catch (error) {
    console.error('Initialization error:', error);
    // Fallback UI for critical components
    if (!document.getElementById('header-container').innerHTML) {
      document.getElementById('header-container').innerHTML = `
        <header class="default-header">
          <a href="/">Ecoviron</a>
        </header>
      `;
    }
    
    if (!document.getElementById('footer-container').innerHTML) {
      document.getElementById('footer-container').innerHTML = `
        <footer class="default-footer">
          <p>© ${new Date().getFullYear()} Ecoviron</p>
        </footer>
      `;
    }
  }
});

// Make globally available for HTML event handlers
window.initComponents = {
  carousel: initCarousel,
  contact: initContactForm,
  products: initFeaturedProducts,
  services: initServices
});