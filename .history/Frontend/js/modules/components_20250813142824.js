import { BASE_PATH, getAssetPath, resolvePath } from '../apiConfig.js';
import { getAsset } from '../api.js';

let componentsLoaded = false;

export async function loadLayoutComponents() {
  if (componentsLoaded) {
    console.log('Components already loaded, skipping...');
    return true;
  }
  
  console.log('Starting layout component loading...');
  console.log('BASE_PATH:', BASE_PATH);
  
  try {
    // Load components with better error handling
    const [headerResult, footerResult] = await Promise.allSettled([
      loadComponent('components/header.html', 'header-container'),
      loadComponent('components/footer.html', 'footer-container')
    ]);

    // Check results and provide detailed logging
    const headerLoaded = headerResult.status === 'fulfilled' && headerResult.value;
    const footerLoaded = footerResult.status === 'fulfilled' && footerResult.value;
    
    console.log('Header loaded:', headerLoaded);
    console.log('Footer loaded:', footerLoaded);
    
    if (headerResult.status === 'rejected') {
      console.error('Header loading failed:', headerResult.reason);
    }
    if (footerResult.status === 'rejected') {
      console.error('Footer loading failed:', footerResult.reason);
    }

    // Load fallback for failed components
    if (!headerLoaded) {
      console.log('Loading fallback header...');
      loadFallbackHeader();
    }
    
    if (!footerLoaded) {
      console.log('Loading fallback footer...');
      loadFallbackFooter();
    }

    // Initialize component-specific functionality after DOM is ready
    // Use setTimeout to ensure DOM is fully processed
    setTimeout(() => {
      initMobileMenu();
      updateCopyrightYear();
    }, 100);
    
    componentsLoaded = true;
    return headerLoaded || footerLoaded; // Success if at least one loaded
  } catch (error) {
    console.error('Unexpected error during component loading:', error);
    loadFallbackLayout();
    return false;
  }
}

function initMobileMenu() {
  console.log('Initializing mobile menu...');
  
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  console.log('Menu toggle found:', !!menuToggle);
  console.log('Nav menu found:', !!navMenu);
  
  if (menuToggle && navMenu) {
    // Remove any existing listeners to prevent duplicates
    menuToggle.removeEventListener('click', handleMenuToggle);
    menuToggle.addEventListener('click', handleMenuToggle);
    
    // Close menu when clicking outside
    document.removeEventListener('click', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);
    
    console.log('Mobile menu initialized successfully');
  } else {
    console.warn('Mobile menu elements not found - skipping initialization');
  }
}

function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    const isActive = navMenu.classList.contains('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    
    console.log('Menu toggled:', !isActive);
  }
}

function handleOutsideClick(e) {
  if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
      console.log('Menu closed by outside click');
    }
  }
}

function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  
  console.log(`Updating ${yearElements.length} copyright year elements to ${currentYear}`);
  
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

function loadFallbackHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  headerContainer.innerHTML = `
    <header class="default-header">
      <div class="container">
        <a href="${BASE_PATH}" class="logo">
          <img src="${getAssetPath('assets/icons/Bionix logo.jpg')}" alt="Logo" />
          Ecoviron
        </a>
        <button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>
        <nav class="nav-menu">
          <a href="${BASE_PATH}index.html">Home</a>
          <a href="${BASE_PATH}about.html">About</a>
          <a href="${BASE_PATH}services/services.html">Services</a>
          <a href="${BASE_PATH}blog/blog.html">Blog</a>
          <a href="${BASE_PATH}contact.html">Contact</a>
          <a href="${BASE_PATH}ecommerce/product-grid.html">Shop</a>
          <a href="${BASE_PATH}ecommerce/cart.html">Cart</a>
        </nav>
      </div>
    </header>
  `;
}

function loadFallbackFooter() {
  const footerContainer = document.getElementById('footer-container');
  
  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="default-footer" style="
        background: #333;
        color: #fff;
        padding: 2rem 0 1rem;
        margin-top: 2rem;
      ">
        <div class="container" style="
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        ">
          <div class="footer-content" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          ">
            <div class="footer-section">
              <h3 style="margin-bottom: 1rem; color: #2c5aa0;">Quick Links</h3>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <a href="${BASE_PATH}" style="color: #ccc; text-decoration: none;">Home</a>
                <a href="${BASE_PATH}services/" style="color: #ccc; text-decoration: none;">Services</a>
                <a href="${BASE_PATH}products/" style="color: #ccc; text-decoration: none;">Products</a>
                <a href="${BASE_PATH}about.html" style="color: #ccc; text-decoration: none;">About</a>
              </div>
            </div>
            <div class="footer-section">
              <h3 style="margin-bottom: 1rem; color: #2c5aa0;">Contact Info</h3>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <p style="margin: 0; color: #ccc;">Email: info@ecoviron.co.ke</p>
                <p style="margin: 0; color: #ccc;">Phone: +254 705 686 093</p>
              </div>
            </div>
          </div>
          
          <div style="
            border-top: 1px solid #555;
            padding-top: 1rem;
            text-align: center;
          ">
            <p class="copyright" style="margin: 0; color: #ccc;">
              © <span data-current-year>${new Date().getFullYear()}</span> Ecoviron. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    `;
    
    console.log('Fallback footer loaded');
  }
}

function loadFallbackLayout() {
  console.log('Loading complete fallback layout...');
  loadFallbackHeader();
  loadFallbackFooter();
  
  // Initialize functionality for fallback components
  setTimeout(() => {
    initMobileMenu();
    updateCopyrightYear();
  }, 100);
}