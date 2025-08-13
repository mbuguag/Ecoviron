import { loadComponent, BASE_PATH, getAssetPath, resolvePath } from '../apiConfig.js';

let componentsLoaded = false;

export async function loadLayoutComponents() {
  if (componentsLoaded) return true;
  
  console.log('Starting layout component loading...');
  console.log('BASE_PATH:', BASE_PATH);

  try {
    // Load header and footer HTML components
    const [headerResult, footerResult] = await Promise.allSettled([
      loadComponent('components/header.html', 'header-container'),
      loadComponent('components/footer.html', 'footer-container')
    ]);

    const headerLoaded = headerResult.status === 'fulfilled' && headerResult.value;
    const footerLoaded = footerResult.status === 'fulfilled' && footerResult.value;

    if (!headerLoaded) {
      console.warn('Header failed to load. Loading fallback...');
      loadFallbackHeader();
    }

    if (!footerLoaded) {
      console.warn('Footer failed to load. Loading fallback...');
      loadFallbackFooter();
    }

    // Initialize mobile menu and dynamic content after DOM updates
    setTimeout(() => {
      initMobileMenu();
      updateCopyrightYear();
    }, 100);

    componentsLoaded = true;
    return headerLoaded || footerLoaded;

  } catch (error) {
    console.error('Unexpected error loading layout components:', error);
    loadFallbackLayout();
    return false;
  }
}

/** -----------------------------
 * Mobile Menu & Utility Functions
 * ----------------------------- */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.removeEventListener('click', handleMenuToggle);
  menuToggle.addEventListener('click', handleMenuToggle);

  document.removeEventListener('click', handleOutsideClick);
  document.addEventListener('click', handleOutsideClick);
}

function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  const navMenu = document.querySelector('.nav-menu');
  if (!navMenu) return;
  navMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open');
}

function handleOutsideClick(e) {
  if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }
}

function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => el.textContent = currentYear);
}

/** -----------------------------
 * Fallback Header & Footer
 * ----------------------------- */
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

  // Mobile menu styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .mobile-menu-toggle { display: block !important; }
      .nav-menu { 
        display: none !important; 
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 1rem;
      }
      .nav-menu.active { display: flex !important; }
      .nav-menu a { padding: 0.75rem; border-bottom: 1px solid #eee; }
    }
  `;
  document.head.appendChild(style);
}

function loadFallbackFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="default-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Quick Links</h3>
            <a href="${BASE_PATH}index.html">Home</a>
            <a href="${BASE_PATH}services/services.html">Services</a>
            <a href="${BASE_PATH}ecommerce/product-grid.html">Products</a>
            <a href="${BASE_PATH}about.html">About</a>
          </div>
          <div class="footer-section">
            <h3>Contact Info</h3>
            <p>Email: info@ecoviron.co.ke</p>
            <p>Phone: +254 705 686 093</p>
          </div>
        </div>
        <p>© <span data-current-year></span> Ecoviron. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function loadFallbackLayout() {
  loadFallbackHeader();
  loadFallbackFooter();
  setTimeout(() => {
    initMobileMenu();
    updateCopyrightYear();
  }, 100);
}
