import { initCarousel } from './modules/carousel.js';
import { initContactForm } from './modules/contact.js';
import { initFeaturedProducts } from './modules/featured-products.js';
import { initServices } from './modules/services.js';
import { loadComponent } from './modules/utils.js';

// Initialize common components
window.addEventListener('DOMContentLoaded', () => {
  loadComponent('components/header.html', 'header-container');
  loadComponent('components/footer.html', 'footer-container');
  
  // Initialize page-specific modules
  if (document.getElementById('carousel-slide')) initCarousel();
  if (document.getElementById('contactForm')) initContactForm();
  if (document.getElementById('featured-products-grid')) initFeaturedProducts();
  if (document.querySelector('.services-grid')) initServices();
});