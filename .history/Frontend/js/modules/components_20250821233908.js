import { loadComponent, BASE_PATH, getAssetPath, isLocalDev } from '../apiConfig.js';

// State management
const layoutState = {
  componentsLoaded: false,
  headerLoaded: false,
  footerLoaded: false,
  retryCount: 0,
  maxRetries: 2
};

// Cache DOM elements
const domCache = {
  headerContainer: null,
  footerContainer: null,
  menuToggle: null,
  navMenu: null
};

export async function loadLayoutComponents() {
  if (layoutState.componentsLoaded) return true;
  
  console.log('Initializing layout component loading...');
  initializeDOMElements();

  try {
    await loadComponentsWithRetry();
    initializeLayoutFeatures();
    layoutState.componentsLoaded = true;
    return layoutState.headerLoaded || layoutState.footerLoaded;
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
  while (layoutState.retryCount <= layoutState.maxRetries) {
    try {
      const [headerResult, footerResult] = await Promise.allSettled([
        loadComponent("header.html", "header-container"),
        loadComponent("footer.html", "footer-container")

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
    if (layoutState.retryCount <= layoutState.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * layoutState.retryCount));
    }
  }

  throw new Error(`Failed to load components after ${layoutState.maxRetries} retries`);
}

function handleComponentResult(result, componentType) {
  if (result.status === 'fulfilled' && result.value) {
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

/** -----------------------------
 * DOM Initialization
 * ----------------------------- */
function initializeDOMElements() {
  domCache.headerContainer = document.getElementById('header-container');
  domCache.footerContainer = document.getElementById('footer-container');
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
}

function initializeLayoutFeatures() {
  // Debounce to ensure DOM is ready
  const initTimeout = setTimeout(() => {
    initMobileMenu();
    updateCopyrightYear();
    setupIntersectionObserver();
    clearTimeout(initTimeout);
  }, 150);
}

/** -----------------------------
 * Mobile Menu & Dynamic Features
 * ----------------------------- */
function initMobileMenu() {
  if (!domCache.menuToggle || !domCache.navMenu) return;

  // Clean up existing listeners
  domCache.menuToggle.replaceWith(domCache.menuToggle.cloneNode(true));
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscapeKey);

  // Initialize new listeners
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');

  domCache.menuToggle.addEventListener('click', handleMenuToggle);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscapeKey);
}

function handleMenuToggle(e) {
  e.preventDefault();
  e.stopPropagation();
  domCache.navMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open');
  domCache.menuToggle.setAttribute(
    'aria-expanded', 
    domCache.navMenu.classList.contains('active')
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
  if (domCache.navMenu?.classList.contains('active')) {
    domCache.navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    domCache.menuToggle?.setAttribute('aria-expanded', 'false');
  }
}

/** -----------------------------
 * Performance Optimizations
 * ----------------------------- */
function setupIntersectionObserver() {
  if ('IntersectionObserver' in window) {
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

    document.querySelectorAll('[data-src], [data-srcset]').forEach(el => {
      observer.observe(el);
    });
  }
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
          <p>© <span data-current-year></span> BIONIX-EHS. All rights reserved.</p>
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