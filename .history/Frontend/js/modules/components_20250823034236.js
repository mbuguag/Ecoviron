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
} from '../../apiConfig.js';

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

// Event handler references for cleanup
const eventHandlers = {
  menuToggle: null,
  outsideClick: null,
  escapeKey: null,
  windowResize: null
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

    // Initialize interactive features after components are loaded
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
  // Try multiple selectors to find mobile menu elements
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle') || 
                       document.querySelector('.header-menu-toggle');
  
  domCache.navMenu = document.querySelector('.nav-menu') || 
                    document.querySelector('.header-nav-list');
  
  domCache.lazyElements = document.querySelectorAll('[data-src], [data-srcset]');
  
  console.log('DOM cache updated:', {
    menuToggle: !!domCache.menuToggle,
    navMenu: !!domCache.navMenu,
    lazyElements: domCache.lazyElements?.length || 0
  });
}

/**
 * Mobile menu initialization with proper event management
 */
function initializeMobileMenu() {
  if (!domCache.menuToggle || !domCache.navMenu) {
    console.warn('Mobile menu elements not found, skipping initialization');
    console.log('Available elements:', {
      menuToggle: domCache.menuToggle?.className || 'not found',
      navMenu: domCache.navMenu?.className || 'not found'
    });
    return;
  }

  // Clean up existing listeners to prevent duplicates
  cleanupMobileMenuListeners();

  // Create event handler functions
  eventHandlers.menuToggle = handleMenuToggle;
  eventHandlers.outsideClick = handleOutsideClick;
  eventHandlers.escapeKey = handleEscapeKey;
  eventHandlers.windowResize = handleWindowResize;

  // Add event listeners
  domCache.menuToggle.addEventListener('click', eventHandlers.menuToggle);
  document.addEventListener('click', eventHandlers.outsideClick);
  document.addEventListener('keydown', eventHandlers.escapeKey);
  window.addEventListener('resize', eventHandlers.windowResize);

  console.log('✅ Mobile menu initialized with selectors:', {
    toggle: domCache.menuToggle.className,
    menu: domCache.navMenu.className
  });
}

/**
 * Clean up mobile menu event listeners
 */
function cleanupMobileMenuListeners() {
  if (eventHandlers.menuToggle && domCache.menuToggle) {
    domCache.menuToggle.removeEventListener('click', eventHandlers.menuToggle);
  }
  
  if (eventHandlers.outsideClick) {
    document.removeEventListener('click', eventHandlers.outsideClick);
  }
  
  if (eventHandlers.escapeKey) {
    document.removeEventListener('keydown', eventHandlers.escapeKey);
  }
  
  if (eventHandlers.windowResize) {
    window.removeEventListener('resize', eventHandlers.windowResize);
  }

  // Clear references
  Object.keys(eventHandlers).forEach(key => {
    eventHandlers[key] = null;
  });
}

/**
 * Handle mobile menu toggle with proper ARIA attributes
 */
function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (!domCache.menuToggle || !domCache.navMenu) return;
  
  const isCurrentlyActive = domCache.navMenu.classList.contains('active');
  const willBeActive = !isCurrentlyActive;
  
  // Toggle classes
  domCache.menuToggle.classList.toggle('active', willBeActive);
  domCache.navMenu.classList.toggle('active', willBeActive);
  document.body.classList.toggle('menu-open', willBeActive);
  
  // Update ARIA attribute
  domCache.menuToggle.setAttribute('aria-expanded', willBeActive.toString());
  
  // Focus management for accessibility
  if (willBeActive) {
    const firstNavLink = domCache.navMenu.querySelector('.nav-link, a');
    firstNavLink?.focus();
  } else {
    domCache.menuToggle.focus();
  }
  
  console.log(`Mobile menu ${willBeActive ? 'opened' : 'closed'}`);
}

/**
 * Close mobile menu when clicking outside
 */
function handleOutsideClick(e) {
  if (!domCache.navMenu?.classList.contains('active')) return;
  
  // Check if click is outside both menu and toggle button
  const clickedInsideMenu = e.target.closest('.nav-menu, .header-nav-list');
  const clickedToggle = e.target.closest('.mobile-menu-toggle, .header-menu-toggle');
  const clickedHeader = e.target.closest('.site-header');
  
  if (!clickedInsideMenu && !clickedToggle && !clickedHeader) {
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
  
  domCache.menuToggle?.classList.remove('active');
  domCache.navMenu.classList.remove('active');
  document.body.classList.remove('menu-open');
  domCache.menuToggle?.setAttribute('aria-expanded', 'false');
  
  console.log('Mobile menu closed');
}

/**
 * Setup intersection observer for lazy loading
 */
function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) {
    console.log('IntersectionObserver not supported in this browser');
    return;
  }

  // Update lazy elements cache
  domCache.lazyElements = document.querySelectorAll('[data-src], [data-srcset]');
  
  if (!domCache.lazyElements?.length) {
    console.log('No lazy loading elements found');
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
        
        // Add loaded class for styling
        element.classList.add('lazy-loaded');
        
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
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;
    
    e.preventDefault();
    const targetId = target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Close mobile menu if open
      closeMobileMenu();
      
      // Update URL without jumping
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, `#${targetId}`);
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
  
  let updatedCount = 0;
  yearElements.forEach(el => {
    if (el.textContent !== currentYear.toString()) {
      el.textContent = currentYear;
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    console.log(`✅ Updated ${updatedCount} copyright year elements`);
  }
}

/**
 * Load fallback header with essential navigation
 */
function loadFallbackHeader() {
  if (!domCache.headerContainer) {
    console.error('Cannot load fallback header: container not found');
    return;
  }

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
  if (!domCache.footerContainer) {
    console.error('Cannot load fallback footer: container not found');
    return;
  }

  const currentYear = new Date().getFullYear();
  
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
          <p>© <span data-current-year>${currentYear}</span> BIONIX-EHS. All rights reserved.</p>
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
  if (document.getElementById(styleId)) {
    console.log('Fallback styles already injected');
    return;
  }

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
    
    .site-header.fallback .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }
    
    .site-header.fallback .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .site-header.fallback .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
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
      max-height: calc(100vh - 80px);
      overflow-y: auto;
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
      font-size: 1.1rem;
    }
    
    .site-footer.fallback ul {
      list-style: none;
      padding: 0;
      margin: 0;
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
      font-size: 0.9rem;
    }
    
    /* Body state when menu is open */
    body.menu-open {
      overflow: hidden;
    }
    
    /* Lazy loading transition */
    [data-src], [data-srcset] {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .lazy-loaded {
      opacity: 1;
    }
    
    /* Desktop Styles */
    @media (min-width: 769px) {
      .site-header.fallback .nav-menu {
        position: static;
        background: transparent;
        border: none;
        display: block !important;
        box-shadow: none;
        max-height: none;
        overflow: visible;
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
      
      body.menu-open {
        overflow: visible;
      }
    }
    
    /* Accessibility and Focus States */
    .site-header.fallback .nav-link:focus-visible,
    .site-header.fallback .logo-link:focus-visible,
    .site-header.fallback .mobile-menu-toggle:focus-visible {
      outline: 2px solid #a5ff9f;
      outline-offset: 2px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .site-header.fallback {
        border-bottom: 2px solid white;
      }
      
      .site-header.fallback .nav-link:hover,
      .site-header.fallback .nav-link:focus {
        background: white;
        color: #046d04;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .site-header.fallback .nav-menu.active {
        animation: none;
      }
      
      .site-header.fallback .hamburger-line,
      .site-header.fallback .nav-link,
      .lazy-loaded {
        transition: none;
      }
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
  
  // Give DOM time to update before initializing features
  setTimeout(() => {
    initializeLayoutFeatures();
  }, 100);
}

/**
 * Public method to refresh layout components
 * Useful for SPA route changes or manual refresh
 */
export function refreshLayoutComponents() {
  console.log('🔄 Refreshing layout components...');
  
  layoutState.componentsLoaded = false;
  layoutState.headerLoaded = false;
  layoutState.footerLoaded = false;
  layoutState.initialized = false;
  
  cleanupMobileMenuListeners();
  
  return loadLayoutComponents();
}

/**
 * Clean up all event listeners (useful for SPA cleanup)
 */
export function cleanupLayout() {
  console.log('🧹 Cleaning up layout...');
  
  cleanupMobileMenuListeners();
  
  // Reset state
  layoutState.initialized = false;
  layoutState.componentsLoaded = false;
  
  // Clear DOM cache
  Object.keys(domCache).forEach(key => {
    domCache[key] = null;
  });
  
  console.log('✅ Layout cleanup completed');
}

/**
 * Get current layout state (useful for debugging)
 */
export function getLayoutState() {
  return {
    ...layoutState,
    domCache: {
      headerContainer: !!domCache.headerContainer,
      footerContainer: !!domCache.footerContainer,
      menuToggle: !!domCache.menuToggle,
      navMenu: !!domCache.navMenu,
      lazyElements: domCache.lazyElements?.length || 0
    }
  };
}

// Auto-load layout when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  loadLayoutComponents().then(success => {
    console.log('Layout loading completed:', success);
  });
});