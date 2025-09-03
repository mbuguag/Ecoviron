import { BASE_PATH, getAssetPath, loadComponent } from '../apiConfig.js';

const CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  debounceTime: 150,
  lazyLoadSelectors: '[data-src], [data-srcset]',
  mobileMenuActiveClass: 'active',
  bodyMenuOpenClass: 'menu-open'
};

const layoutState = {
  componentsLoaded: false,
  headerLoaded: false,
  footerLoaded: false,
  retryCount: 0,
  observers: []
};

const domCache = {
  headerContainer: null,
  footerContainer: null,
  menuToggle: null,
  navMenu: null
};

/**
 * Main Layout Loader
 */
export async function loadLayoutComponents() {
  if (layoutState.componentsLoaded) return true;
  
  console.log('Initializing layout component loading...');
  initializeDOMElements();
  showLoadingStates();

  try {
    await loadComponentsWithRetry();
    initializeLayoutFeatures();
    layoutState.componentsLoaded = true;
    console.log('Layout components loaded successfully');
    return true;
  } catch (error) {
    console.error('Critical error loading layout components:', error);
    loadFallbackLayout();
    return false;
  }
}

/** -----------------------------
 * Core Loading Functions
 * ----------------------------- */

async function loadComponentsWithRetry() {
  while (layoutState.retryCount <= CONFIG.maxRetries) {
    try {
      const [headerResult, footerResult] = await Promise.allSettled([
        loadComponent('header.html', 'header-container', {
          retries: 1,
          cacheBust: isLocalDev,
          fallback: false // We'll handle fallback at higher level
        }),
        loadComponent('footer.html', 'footer-container', {
          retries: 1,
          cacheBust: isLocalDev,
          fallback: false
        })
      ]);

      layoutState.headerLoaded = handleComponentResult(headerResult, 'header');
      layoutState.footerLoaded = handleComponentResult(footerResult, 'footer');

      if (layoutState.headerLoaded && layoutState.footerLoaded) {
        return;
      }
    } catch (error) {
      console.warn(`Attempt ${layoutState.retryCount + 1} failed:`, error);
    }

    layoutState.retryCount++;
    if (layoutState.retryCount <= CONFIG.maxRetries) {
      await new Promise(r => setTimeout(r, CONFIG.retryDelay * layoutState.retryCount));
    }
  }

  throw new Error(`Failed to load components after ${CONFIG.maxRetries} retries`);
}

function handleComponentResult(result, componentType) {
  if (result.status === 'fulfilled' && result.value && isValidComponent(result.value)) {
    return true;
  }
  
  console.warn(`${componentType} failed to load. Loading fallback...`);
  if (componentType === 'header') {
    loadFallbackHeader();
  } else {
    loadFallbackFooter();
  }
  return false;
}

function isValidComponent(html) {
  if (!html) return false;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children.length > 0;
}

/** -----------------------------
 * DOM Initialization
 * ----------------------------- */

function initializeDOMElements() {
  domCache.headerContainer = document.getElementById('header-container');
  domCache.footerContainer = document.getElementById('footer-container');
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
}

function showLoadingStates() {
  showLoadingState('header-container');
  showLoadingState('footer-container');
}

function showLoadingState(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="component-loading">
        <div class="loading-spinner"></div>
        <p>Loading ${containerId.replace('-container', '')}...</p>
      </div>
    `;
  }
}

function initializeLayoutFeatures() {
  cleanupEventListeners();
  
  const initTimeout = setTimeout(() => {
    initMobileMenu();
    updateCopyrightYear();
    setupIntersectionObserver();
    clearTimeout(initTimeout);
  }, CONFIG.debounceTime);
}

function cleanupEventListeners() {
  if (domCache.menuToggle) {
    domCache.menuToggle.removeEventListener('click', handleMenuToggle);
  }
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscapeKey);
}

/** -----------------------------
 * Mobile Menu Functionality
 * ----------------------------- */

function initMobileMenu() {
  if (!domCache.menuToggle || !domCache.navMenu) {
    console.warn('Mobile menu elements not found');
    return;
  }

  // Clone to remove existing listeners
  const newToggle = domCache.menuToggle.cloneNode(true);
  domCache.menuToggle.replaceWith(newToggle);
  domCache.menuToggle = newToggle;

  domCache.menuToggle.addEventListener('click', handleMenuToggle);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscapeKey);
}

function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  domCache.navMenu.classList.toggle(CONFIG.mobileMenuActiveClass);
  document.body.classList.toggle(CONFIG.bodyMenuOpenClass);
  domCache.menuToggle.setAttribute(
    'aria-expanded', 
    domCache.navMenu.classList.contains(CONFIG.mobileMenuActiveClass)
  );
}

function handleOutsideClick(e) {
  if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
    closeMobileMenu();
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeMobileMenu();
  }
}

function closeMobileMenu() {
  if (domCache.navMenu?.classList.contains(CONFIG.mobileMenuActiveClass)) {
    domCache.navMenu.classList.remove(CONFIG.mobileMenuActiveClass);
    document.body.classList.remove(CONFIG.bodyMenuOpenClass);
    domCache.menuToggle?.setAttribute('aria-expanded', 'false');
  }
}

/** -----------------------------
 * Performance Optimizations
 * ----------------------------- */

function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyElement = entry.target;
        if (lazyElement.dataset.src) {
          lazyElement.src = lazyElement.dataset.src;
        }
        if (lazyElement.dataset.srcset) {
          lazyElement.srcset = lazyElement.dataset.srcset;
        }
        observer.unobserve(lazyElement);
      }
    });
  });

  document.querySelectorAll(CONFIG.lazyLoadSelectors).forEach(el => {
    observer.observe(el);
  });

  // Store for potential cleanup
  layoutState.observers.push(observer);
}

/** -----------------------------
 * Fallback Components
 * ----------------------------- */

function loadFallbackHeader() {
  if (!domCache.headerContainer) return;

  const fallbackHTML = `
    <header class="site-header fallback">
      <div class="container">
        <div class="logo-section">
          <a href="${BASE_PATH}" class="logo-link" aria-label="BIONIX-EHS Home">
            <img src="${getAssetPath('assets/icons/Bionix logo.jpg')}" 
                 alt="Bionix-HSE Logo" 
                 class="logo-img"
                 width="65"
                 height="75"
                 loading="lazy">
            <h1 class="logo-text">BIONIX-EHS</h1>
          </a>
        </div>

        <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <nav class="nav-menu" aria-label="Primary navigation">
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
}

function loadFallbackFooter() {
  if (!domCache.footerContainer) return;

  const currentYear = new Date().getFullYear();
  
  domCache.footerContainer.innerHTML = `
    <footer class="site-footer fallback">
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
}

function injectFallbackStyles() {
  const styleId = 'fallback-header-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .site-header.fallback {
      background: linear-gradient(135deg, #046d04 0%, #034f03 100%);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .site-header.fallback .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .site-header.fallback .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    
    .site-header.fallback .logo-text {
      color: white;
      font-size: 1.75rem;
      margin: 0;
    }
    
    .site-header.fallback .nav-menu {
      display: none;
      width: 100%;
    }
    
    .site-header.fallback .nav-menu.active {
      display: block;
    }
    
    .site-header.fallback .nav-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0;
    }
    
    .site-header.fallback .nav-link {
      display: block;
      padding: 0.75rem;
      color: white;
      text-decoration: none;
    }

    .component-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #666;
    }
    
    .loading-spinner {
      border: 3px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      border-top: 3px solid #046d04;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (min-width: 769px) {
      .site-header.fallback .nav-menu {
        display: block;
        width: auto;
      }
      
      .site-header.fallback .nav-list {
        display: flex;
        gap: 1rem;
        margin: 0;
      }
      
      .site-header.fallback .mobile-menu-toggle {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
}

/** -----------------------------
 * Utility Functions
 * ----------------------------- */

function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    if (el.textContent !== currentYear.toString()) {
      el.textContent = currentYear;
    }
  });
}

function loadFallbackLayout() {
  loadFallbackHeader();
  loadFallbackFooter();
  initializeLayoutFeatures();
}

/** -----------------------------
 * Cleanup Function (optional)
 * ----------------------------- */

export function cleanupLayoutComponents() {
  cleanupEventListeners();
  layoutState.observers.forEach(observer => {
    observer.disconnect();
  });
  layoutState.observers = [];
}