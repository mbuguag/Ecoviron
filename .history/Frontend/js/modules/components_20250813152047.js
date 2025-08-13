import { loadComponent, BASE_PATH, getAssetPath, resolvePath, fixTemplateLinks } from '../apiConfig.js';

let componentsLoaded = false;

export async function loadLayoutComponents() {
  if (componentsLoaded) {
    console.log('⏭️  Layout components already loaded, skipping...');
    return true;
  }
  
  console.log('🚀 Starting layout component loading...');
  console.log('📍 BASE_PATH:', BASE_PATH);
  console.log('🌐 Current location:', window.location.href);

  try {
    // Load header and footer HTML components
    console.log('📦 Attempting to load header and footer components...');
    const [headerResult, footerResult] = await Promise.allSettled([
      loadComponent('components/header.html', 'header-container'),
      loadComponent('components/footer.html', 'footer-container')
    ]);

    const headerLoaded = headerResult.status === 'fulfilled' && headerResult.value;
    const footerLoaded = footerResult.status === 'fulfilled' && footerResult.value;

    console.log('📊 Component loading results:', {
      header: headerLoaded ? '✅ Success' : '❌ Failed',
      footer: footerLoaded ? '✅ Success' : '❌ Failed'
    });

    if (!headerLoaded) {
      console.warn('🔄 Header failed to load. Loading fallback...');
      loadFallbackHeader();
    }

    if (!footerLoaded) {
      console.warn('🔄 Footer failed to load. Loading fallback...');
      loadFallbackFooter();
    }

    // Initialize mobile menu and dynamic content after DOM updates
    setTimeout(() => {
      console.log('🔧 Initializing UI components...');
      initMobileMenu();
      updateCopyrightYear();
      fixTemplateLinks(); // Fix any unresolved template literals
    }, 100);

    componentsLoaded = true;
    console.log('🎉 Layout components loading complete!');
    return headerLoaded || footerLoaded;

  } catch (error) {
    console.error('💥 Unexpected error loading layout components:', error);
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

  // Fix: Use resolvePath for all links to ensure proper path resolution
  const homePath = resolvePath('index.html');
  const aboutPath = resolvePath('about.html');
  const servicesPath = resolvePath('services/services.html');
  const blogPath = resolvePath('blog/blog.html');
  const contactPath = resolvePath('contact.html');
  const shopPath = resolvePath('ecommerce/product-grid.html');
  const cartPath = resolvePath('ecommerce/cart.html');
  const logoPath = getAssetPath('assets/icons/Bionix logo.jpg');

  headerContainer.innerHTML = `
    <header class="site-header">
      <div class="container">
        <div class="logo-section">
          <a href="${homePath}" class="logo-link">
            <img src="${logoPath}" alt="Bionix-HSE Logo" class="logo-img" />
            <h2 class="logo-text">BIONIX-EHS</h2>
          </a>
        </div>
        <button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>
        <nav class="nav-menu">
          <a href="${homePath}">Home</a>
          <a href="${aboutPath}">About</a>
          <a href="${servicesPath}">Services</a>
          <a href="${blogPath}">Blog</a>
          <a href="${contactPath}">Contact</a>
          
          <div class="dropdown">
            <a href="${shopPath}">Products ▾</a>
            <div class="dropdown-content">
              <a href="${shopPath}">Shop</a>
              <a href="${cartPath}">Cart</a>
            </div>
          </div>

          <a href="${cartPath}" class="cart-icon-link">
            <i class="fas fa-shopping-cart"></i>
            <span id="mini-cart-count" class="cart-count-badge">0</span>
          </a>

          <span id="authArea"></span>
        </nav>
      </div>
    </header>
  `;

  // Enhanced mobile menu styles
  const style = document.createElement('style');
  style.textContent = `
    .site-header {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .site-header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
    }
    
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    
    .logo-img {
      height: 40px;
      width: auto;
      margin-right: 10px;
    }
    
    .logo-text {
      margin: 0;
      font-size: 1.5rem;
      color: #2c5530;
    }
    
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }
    
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    
    .nav-menu a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .nav-menu a:hover {
      color: #2c5530;
    }
    
    .dropdown {
      position: relative;
    }
    
    .dropdown-content {
      display: none;
      position: absolute;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 4px;
      padding: 0.5rem 0;
      min-width: 150px;
      top: 100%;
      left: 0;
      z-index: 1001;
    }
    
    .dropdown:hover .dropdown-content {
      display: block;
    }
    
    .dropdown-content a {
      display: block;
      padding: 0.5rem 1rem;
      white-space: nowrap;
    }
    
    .cart-icon-link {
      position: relative;
    }
    
    .cart-count-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .mobile-menu-toggle { 
        display: block !important; 
      }
      
      .nav-menu { 
        display: none !important; 
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        padding: 1rem;
        gap: 0;
      }
      
      .nav-menu.active { 
        display: flex !important; 
      }
      
      .nav-menu a { 
        padding: 0.75rem 0; 
        border-bottom: 1px solid #eee;
        width: 100%;
      }
      
      .dropdown-content {
        position: static;
        display: block;
        box-shadow: none;
        background: #f8f9fa;
        margin-left: 1rem;
      }
      
      .nav-menu.active .dropdown-content {
        display: block;
      }
    }
  `;
  document.head.appendChild(style);
}

function loadFallbackFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  // Fix: Use resolvePath for all links
  const homePath = resolvePath('index.html');
  const servicesPath = resolvePath('services/services.html');
  const shopPath = resolvePath('ecommerce/product-grid.html');
  const aboutPath = resolvePath('about.html');

  footerContainer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Quick Links</h3>
            <a href="${homePath}">Home</a>
            <a href="${servicesPath}">Services</a>
            <a href="${shopPath}">Products</a>
            <a href="${aboutPath}">About</a>
          </div>
          <div class="footer-section">
            <h3>Contact Info</h3>
            <p>Email: info@ecoviron.co.ke</p>
            <p>Phone: +254 705 686 093</p>
          </div>
          <div class="footer-section">
            <h3>Follow Us</h3>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© <span data-current-year></span> Bionix-EHS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;

  // Footer styles
  const footerStyle = document.createElement('style');
  footerStyle.textContent = `
    .site-footer {
      background: #2c5530;
      color: white;
      padding: 3rem 0 1rem;
      margin-top: auto;
    }
    
    .site-footer .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .footer-section h3 {
      margin-bottom: 1rem;
      color: #a8d5a8;
    }
    
    .footer-section a {
      color: white;
      text-decoration: none;
      display: block;
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;
    }
    
    .footer-section a:hover {
      color: #a8d5a8;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
    }
    
    .social-links a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transition: background-color 0.3s ease;
    }
    
    .social-links a:hover {
      background: rgba(255,255,255,0.2);
    }
    
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 1rem;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(footerStyle);
}

function loadFallbackLayout() {
  loadFallbackHeader();
  loadFallbackFooter();
  setTimeout(() => {
    initMobileMenu();
    updateCopyrightYear();
    fixTemplateLinks(); // Fix any unresolved template literals
  }, 100);
}

// Additional debugging function
export function debugPaths() {
  console.log('=== PATH DEBUG INFO ===');
  console.log('BASE_PATH:', BASE_PATH);
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
  console.log('Pathname:', window.location.pathname);
  console.log('Sample resolved paths:');
  console.log('  index.html ->', resolvePath('index.html'));
  console.log('  logo path ->', getAssetPath('assets/icons/Bionix logo.jpg'));
  console.log('=======================');
}