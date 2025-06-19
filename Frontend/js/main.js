import { initCarousel } from './modules/carousel.js';
import { initContactForm } from './modules/contact.js';
import { initFeaturedProducts } from './modules/featured-products.js';
import { initServices } from './modules/services.js';
import { loadLayoutComponents } from './modules/components.js';
import { initAboutSection } from './modules/about.js';


// Initialize all components and page modules
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load essential components first
    await loadLayoutComponents();

    const headerLoaded = document.getElementById('header-container').innerHTML.trim().length > 0;
    const footerLoaded = document.getElementById('footer-container').innerHTML.trim().length > 0;

    if (!headerLoaded || !footerLoaded) {
      throw new Error('Header or footer not loaded');
    }

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

    if (document.getElementById('who-we-are-content')) {
  initTasks.push(initAboutSection());
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
};

// console.log('Current path:', window.location.pathname);
// console.log('BASE_PATH:', BASE_PATH);