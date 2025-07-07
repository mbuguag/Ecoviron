import { initCarousel } from './modules/carousel.js';
import { initContactForm } from './modules/contact.js';
import { initFeaturedProducts } from './modules/featured-products.js';
import { initServices } from './modules/services.js';
import { loadComponent, resolvePath } from './modules/utils.js';
import { loadLayoutComponents  } from './modules/components.js';


// Initialize all components and page modules
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
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  if (document.getElementById('carousel-slide')) {
    initializeCarousel();
  }

  if (document.querySelector('.services-grid')) {
    initializeServicesGrid();
  }

  if (document.getElementById('contact-form')) {
    initializeContactForm();
  }

  if (document.getElementById('featured-products-grid')) {
    initializeFeaturedProducts();
  }

  if (document.getElementById('product-grid')) {
    initializeProductGrid();
  }
});

// Make globally available for HTML event handlers
window.initComponents = {
  carousel: initCarousel,
  contact: initContactForm,
  products: initFeaturedProducts,
  services: initServices
};