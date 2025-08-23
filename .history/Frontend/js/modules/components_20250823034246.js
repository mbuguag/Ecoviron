/**
 * Layout Component Manager
 * Handles loading and initialization of header/footer components with fallbacks
 */

import { 
  BASE_PATH, 
  getAssetPath, 
  isLocalDev, 
  STATIC_BASE_URL, 
  config, 
  loadComponent, 
  loadComponents 
} from '../apiConfig.js';

// Layout state management
const layoutState = {
  initialized: false,
  componentsLoaded: false,
  headerLoaded: false,
  footerLoaded: false,
  retryCount: 0,
  maxRetries: 2
};

// Cached DOM elements for performance
const domCache = {
  headerContainer: null,
  footerContainer: null,
  menuToggle: null,
  navMenu: null,
  lazyElements: null
};

/**
 * Main layout component loader with comprehensive error handling
 * @returns {Promise<boolean>} Success status
 */
export async function loadLayoutComponents() {
  if (layoutState.componentsLoaded) {
    console.log('Layout components already loaded, skipping...');
    return true;
  }
  
  console.log('🚀 Initializing layout component loading...');
  initializeDOMElements();

  try {
    // Use batch loading for better performance
    const componentResults = await loadComponents([
      { fileName: 'header.html', containerId: 'header-container' },
      { fileName: 'footer.html', containerId: 'footer-container' }
    ]);

    initMobileMenu();

    // Update state based on results
    layoutState.headerLoaded = componentResults['header.html'] || false;
    layoutState.footerLoaded = componentResults['footer.html'] || false;

    // Load fallbacks for failed components
    if (!layoutState.headerLoaded) {
      console.warn('Header component failed, loading fallback...');
      loadFallbackHeader();
      layoutState.headerLoaded = true;
    }

    if (!layoutState.footerLoaded) {
      console.warn('Footer component failed, loading fallback...');
      loadFallbackFooter();
      layoutState.footerLoaded = true;
    }

    // Initialize interactive features
    initializeLayoutFeatures();
    layoutState.componentsLoaded = true;
    
    console.log('✅ Layout initialization complete:', {
      header: layoutState.headerLoaded,
      footer: layoutState.footerLoaded,
      fallbacksUsed: !componentResults['header.html'] || !componentResults['footer.html']
    });

    return true;

  } catch (error) {
    console.error('❌ Critical error during layout loading:', error);
    loadFallbackLayout();
    layoutState.componentsLoaded = true; // Prevent infinite retry loops
    return false;
  }
}

function initMobileMenu() {
  const menuToggle = document.querySelector('.header-menu-toggle');
  const navMenu = document.querySelector('.header-nav-list');
  if (!menuToggle || !navMenu) {
    console.log("⚠️ Mobile menu elements not found, skipping initialization");
    return;
  }

  // Toggle open/close
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header') && navMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  console.log("✅ Mobile menu initialized");
}


/**
 * Initialize cached DOM element references
 */
function initializeDOMElements() {
  domCache.headerContainer = document.getElementById('header-container');
  domCache.footerContainer = document.getElementById('footer-container');
  
  if (!domCache.headerContainer) {
    console.error('Missing required element: #header-container');
  }
  
  if (!domCache.footerContainer) {
    console.error('Missing required element: #footer-container');
  }
}

/**
 * Initialize layout features with delayed execution for DOM readiness
 */
function initializeLayoutFeatures() {
  // Use requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    updateDOMCache(); // Refresh cache after component loading
    initializeMobileMenu();
    updateCopyrightYear();
    setupIntersectionObserver();
    setupGlobalEventListeners();
  });
}

/**
 * Update DOM cache after components are loaded
 */
function updateDOMCache() {
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
  domCache.lazyElements = document.querySelectorAll('[data-src], [data-srcset]');
}

/**
 * Mobile menu initialization with proper event management
 */
function initializeMobileMenu() {
  if (!domCache.menuToggle || !domCache.navMenu) {
    console.warn('Mobile menu elements not found, skipping initialization');
    return;
  }

  // Clean up existing listeners to prevent duplicates
  cleanupMobileMenuListeners();

  // Add fresh event listeners
  domCache.menuToggle.addEventListener('click', handleMenuToggle);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscapeKey);
  
  // Handle window resize to close mobile menu on desktop
  window.addEventListener('resize', handleWindowResize);

  console.log('✅ Mobile menu initialized');
}

/**
 * Clean up mobile menu event listeners
 */
function cleanupMobileMenuListeners() {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('resize', handleWindowResize);
}

/**
 * Handle mobile menu toggle with proper ARIA attributes
 */
function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const isActive = domCache.navMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open', isActive);
  domCache.menuToggle.setAttribute('aria-expanded', isActive.toString());
  
  // Focus management for accessibility
  if (isActive) {
    const firstNavLink = domCache.navMenu.querySelector('.nav-link');
    firstNavLink?.focus();
  }
}

/**
 * Close mobile menu when clicking outside
 */
function handleOutsideClick(e) {
  if (!domCache.navMenu?.classList.contains('active')) return;
  
  if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
    closeMobileMenu();
  }
}

/**
 * Handle escape key to close mobile menu
 */
function handleEscapeKey(e) {
  if (e.key === 'Escape' && domCache.navMenu?.classList.contains('active')) {
    closeMobileMenu();
    domCache.menuToggle?.focus(); // Return focus to toggle button
  }
}

/**
 * Handle window resize to close mobile menu on desktop breakpoint
 */
function handleWindowResize() {
  if (window.innerWidth > 768 && domCache.navMenu?.classList.contains('active')) {
    closeMobileMenu();
  }
}

/**
 * Close mobile menu and clean up states
 */
function closeMobileMenu() {
  if (!domCache.navMenu?.classList.contains('active')) return;
  
  domCache.navMenu.classList.remove('active');
  document.body.classList.remove('menu-open');
  domCache.menuToggle?.setAttribute('aria-expanded', 'false');
}

/**
 * Setup intersection observer for lazy loading
 */
function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window) || !domCache.lazyElements?.length) {
    console.log('IntersectionObserver not available or no lazy elements found');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Load lazy images
        if (element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }
        
        if (element.dataset.srcset) {
          element.srcset = element.dataset.srcset;
          element.removeAttribute('data-srcset');
        }
        
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px 0px', // Load images 50px before they come into view
    threshold: 0.1
  });

  domCache.lazyElements.forEach(el => observer.observe(el));
  console.log(`✅ Lazy loading setup for ${domCache.lazyElements.length} elements`);
}

/**
 * Setup global event listeners for better UX
 */
function setupGlobalEventListeners() {
  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        closeMobileMenu();
      }
    }
  });
}

/**
 * Update copyright year in footer
 */
function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  
  yearElements.forEach(el => {
    if (el.textContent !== currentYear.toString()) {
      el.textContent = currentYear;
    }
  });
  
  if (yearElements.length > 0) {
    console.log(`✅ Updated ${yearElements.length} copyright year elements`);
  }
}

/**
 * Load fallback header with essential navigation
 */
function loadFallbackHeader() {
  if (!domCache.headerContainer) return;

  const fallbackHTML = `
    <header class="site-header fallback" role="banner">
      <div class="container">
        <div class="logo-section">
          <a href="${BASE_PATH}" class="logo-link" aria-label="BIONIX-EHS Home">
            <img src="${getAssetPath('assets/icons/Bionix logo.jpg')}" 
                 alt="Bionix-HSE Logo" 
                 class="logo-img"
                 width="65"
                 height="75"
                 loading="lazy"
                 onerror="this.style.display='none'">
            <h1 class="logo-text">BIONIX-EHS</h1>
          </a>
        </div>

        <button class="mobile-menu-toggle" 
                type="button"
                aria-label="Toggle navigation menu" 
                aria-expanded="false"
                aria-controls="primary-navigation">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="nav-menu" aria-label="Primary navigation" id="primary-navigation">
          <ul class="nav-list">
            <li><a href="${BASE_PATH}index.html" class="nav-link">Home</a></li>
            <li><a href="${BASE_PATH}about.html" class="nav-link">About</a></li>
            <li><a href="${BASE_PATH}services/services.html" class="nav-link">Services</a></li>
            <li><a href="${BASE_PATH}blog/blog.html" class="nav-link">Blog</a></li>
            <li><a href="${BASE_PATH}contact.html" class="nav-link">Contact</a></li>
            <li><a href="${BASE_PATH}ecommerce/product-grid.html" class="nav-link">Shop</a></li>
            <li><a href="${BASE_PATH}ecommerce/cart.html" class="nav-link">Cart</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `;

  domCache.headerContainer.innerHTML = fallbackHTML;
  injectFallbackStyles();
  console.log('✅ Fallback header loaded');
}

/**
 * Load fallback footer with essential links
 */
function loadFallbackFooter() {
  if (!domCache.footerContainer) return;

  domCache.footerContainer.innerHTML = `
    <footer class="site-footer fallback" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="${BASE_PATH}index.html">Home</a></li>
              <li><a href="${BASE_PATH}services/services.html">Services</a></li>
              <li><a href="${BASE_PATH}ecommerce/product-grid.html">Products</a></li>
              <li><a href="${BASE_PATH}about.html">About Us</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Contact</h3>
            <address>
              <p>Email: <a href="mailto:info@bionixehs.com">info@bionixehs.com</a></p>
              <p>Phone: <a href="tel:+254705686093">+254 705 686 093</a></p>
            </address>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© <span data-current-year>${new Date().getFullYear()}</span> BIONIX-EHS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
  
  console.log('✅ Fallback footer loaded');
}

/**
 * Inject critical CSS for fallback components
 */
function injectFallbackStyles() {
  const styleId = 'fallback-layout-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Fallback Header Styles */
    .site-header.fallback {
      backdrop-filter: blur(12px);
      background: rgba(4, 109, 4, 0.85);
      padding: 0.75rem 1rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .site-header.fallback .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .site-header.fallback .logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }
    
    .site-header.fallback .logo-link:hover {
      opacity: 0.9;
    }
    
    .site-header.fallback .logo-img {
      border-radius: 4px;
      object-fit: contain;
    }
    
    .site-header.fallback .logo-text {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .site-header.fallback .mobile-menu-toggle {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    
    .site-header.fallback .mobile-menu-toggle:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .site-header.fallback .hamburger-line {
      display: block;
      width: 24px;
      height: 3px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    
    .site-header.fallback .nav-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(4, 109, 4, 0.95);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255,255,255,0.15);
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .site-header.fallback .nav-menu.active {
      display: block;
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .site-header.fallback .nav-list {
      list-style: none;
      padding: 0.5rem 0;
      margin: 0;
    }
    
    .site-header.fallback .nav-link {
      display: block;
      padding: 0.75rem 1rem;
      color: white;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }
    
    .site-header.fallback .nav-link:hover,
    .site-header.fallback .nav-link:focus {
      background: rgba(255,255,255,0.1);
      border-left-color: #a5ff9f;
      color: #a5ff9f;
    }
    
    /* Fallback Footer Styles */
    .site-footer.fallback {
      background: #2c3e50;
      color: white;
      padding: 2rem 0 1rem;
      margin-top: auto;
    }
    
    .site-footer.fallback .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .site-footer.fallback .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 1.5rem;
    }
    
    .site-footer.fallback h3 {
      color: #a5ff9f;
      margin-bottom: 1rem;
    }
    
    .site-footer.fallback ul {
      list-style: none;
      padding: 0;
    }
    
    .site-footer.fallback li {
      margin-bottom: 0.5rem;
    }
    
    .site-footer.fallback a {
      color: #ecf0f1;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .site-footer.fallback a:hover {
      color: #a5ff9f;
    }
    
    .site-footer.fallback .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 1rem;
      text-align: center;
      color: #bdc3c7;
    }
    
    /* Desktop Styles */
    @media (min-width: 769px) {
      .site-header.fallback .nav-menu {
        position: static;
        background: transparent;
        border: none;
        display: block !important;
        box-shadow: none;
      }
      
      .site-header.fallback .nav-list {
        display: flex;
        gap: 0.5rem;
        padding: 0;
      }
      
      .site-header.fallback .nav-link {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
      }
      
      .site-header.fallback .mobile-menu-toggle {
        display: none;
      }
    }
    
    /* Accessibility and Focus States */
    .site-header.fallback .nav-link:focus-visible,
    .site-header.fallback .logo-link:focus-visible,
    .site-header.fallback .mobile-menu-toggle:focus-visible {
      outline: 2px solid #a5ff9f;
      outline-offset: 2px;
    }
  `;

  document.head.appendChild(style);
  console.log('✅ Fallback styles injected');
}

/**
 * Load complete fallback layout (both header and footer)
 */
function loadFallbackLayout() {
  console.warn('⚠️ Loading complete fallback layout due to component failures');
  loadFallbackHeader();
  loadFallbackFooter();
  initializeLayoutFeatures();
}

/**
 * Public method to refresh layout components
 * Useful for SPA route changes or manual refresh
 */
export function refreshLayoutComponents() {
  layoutState.componentsLoaded = false;
  layoutState.headerLoaded = false;
  layoutState.footerLoaded = false;
  cleanupMobileMenuListeners();
  return loadLayoutComponents();
}

/**
 * Clean up all event listeners (useful for SPA cleanup)
 */
export function cleanupLayout() {
  cleanupMobileMenuListeners();
  layoutState.initialized = false;
  console.log('✅ Layout cleanup completed');
}