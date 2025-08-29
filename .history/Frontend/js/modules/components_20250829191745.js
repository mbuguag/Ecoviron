import {
  BASE_PATH,
  getAssetPath,
  loadComponents
} from '../apiConfig.js';

// Layout state
const layoutState = {
  initialized: false,
  headerLoaded: false,
  footerLoaded: false,
  featuresInitialized: false
};

// Cache DOM elements
const domCache = {
  header: null,
  footer: null,
  menuToggle: null,
  navMenu: null
};

/**
 * Load header and footer components
 */
export async function loadLayoutComponents() {
  if (layoutState.initialized) {
    console.log('Layout already initialized, skipping');
    return true;
  }

  // Assign DOM containers
  domCache.header = document.getElementById('header-container');
  domCache.footer = document.getElementById('footer-container');

  // Add loading state to body
  document.body.classList.remove('components-loaded');

  try {
    const results = await loadComponents([
      { fileName: 'header.html', containerId: 'header-container' },
      { fileName: 'footer.html', containerId: 'footer-container' }
    ]);

    layoutState.headerLoaded = results['header.html'];
    layoutState.footerLoaded = results['footer.html'];

    if (!layoutState.headerLoaded) loadFallbackHeader();
    if (!layoutState.footerLoaded) loadFallbackFooter();

    initFeatures();
    layoutState.initialized = true;

    // Mark as loaded
    document.body.classList.add('components-loaded');
    return true;

  } catch (err) {
    console.error('Layout loading failed, using fallbacks', err);
    loadFallbackHeader();
    loadFallbackFooter();
    initFeatures();
    layoutState.initialized = true;
    document.body.classList.add('components-loaded');
    return false;
  }
}

/**
 * Initialize layout features
 */
function initFeatures() {
  if (layoutState.featuresInitialized) return; // ✅ prevents double init

  cacheInteractiveElements();
  initMobileMenu();
  initSmoothScroll();
  initLazyLoading();
  updateCopyright();

  layoutState.featuresInitialized = true;
  console.log('[layout] Features initialized');
}

/**
 * Cache interactive elements
 */
function cacheInteractiveElements() {
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle, .header-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
}

/**
 * Mobile menu toggle with event listener cleanup
 */
function initMobileMenu() {
  const toggle = document.querySelector('.header-menu-toggle, .mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.menu-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggle || !mobileNav) return;

  // ✅ Clean up existing listeners to prevent duplicates
  const newToggle = toggle.cloneNode(true);
  const newOverlay = overlay?.cloneNode(true);
  const newCloseBtn = closeBtn?.cloneNode(true);
  
  toggle.parentNode.replaceChild(newToggle, toggle);
  if (overlay && newOverlay) overlay.parentNode.replaceChild(newOverlay, overlay);
  if (closeBtn && newCloseBtn) closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  function openMenu() {
    mobileNav.classList.add('active');
    newOverlay?.classList.add('active');
    document.body.classList.add('menu-open');
    newToggle.classList.add('active');
    newToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileNav.classList.remove('active');
    newOverlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
    newToggle.classList.remove('active');
    newToggle.setAttribute('aria-expanded', 'false');
  }

  newToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isActive = mobileNav.classList.contains('active');
    isActive ? closeMenu() : openMenu();
  });

  newOverlay?.addEventListener('click', closeMenu);
  newCloseBtn?.addEventListener('click', closeMenu);

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeMenu();
    }
  });
}

/**
 * Smooth scroll for anchor links - FIXED: Removed { once: true }
 */
function initSmoothScroll() {
  // ✅ Store reference to prevent duplicate listeners
  if (initSmoothScroll.initialized) return;
  
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      domCache.navMenu?.classList.remove('active');
      domCache.menuToggle?.classList.remove('active');
    }
  }); // ✅ FIXED: Removed { once: true }
  
  initSmoothScroll.initialized = true;
}

/**
 * Lazy loading with cleanup
 */
function initLazyLoading() {
  const lazyItems = document.querySelectorAll('[data-src], [data-srcset]');
  if (!('IntersectionObserver' in window) || lazyItems.length === 0) return;

  // ✅ Store observer reference for cleanup
  if (window.lazyLoadObserver) {
    window.lazyLoadObserver.disconnect();
  }

  window.lazyLoadObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        }
        if (el.dataset.srcset) {
          el.srcset = el.dataset.srcset;
          el.removeAttribute('data-srcset');
        }
        window.lazyLoadObserver.unobserve(el);
      }
    });
  });

  lazyItems.forEach(el => window.lazyLoadObserver.observe(el));
}

/**
 * Update copyright year
 */
function updateCopyright() {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]')
    .forEach(el => el.textContent = year);
}

/**
 * Fallback header
 */
function loadFallbackHeader() {
  if (!domCache.header) return;
  domCache.header.innerHTML = `
    <header class="fallback-header">
      <a href="${BASE_PATH}">
        <img src="${getAssetPath('assets/icons/Bionix logo.jpg')}" 
             alt="Logo" width="60" height="60">
      </a>
      <button class="mobile-menu-toggle" aria-expanded="false">☰</button>
      <nav class="nav-menu">
        <a href="${BASE_PATH}index.html">Home</a>
        <a href="${BASE_PATH}about.html">About</a>
        <a href="${BASE_PATH}services/services.html">Services</a>
        <a href="${BASE_PATH}blog/blog.html">Blog</a>
        <a href="${BASE_PATH}contact.html">Contact</a>
        <a href="${BASE_PATH}ecommerce/product-grid.html">Shop</a>
      </nav>
    </header>`;
}

/**
 * Fallback footer
 */
function loadFallbackFooter() {
  if (!domCache.footer) return;
  const year = new Date().getFullYear();
  domCache.footer.innerHTML = `
    <footer class="fallback-footer">
      <p>© ${year} BIONIX-EHS. All rights reserved.</p>
    </footer>`;
}

/**
 * Cleanup function for page unload/tab switching
 */
function cleanup() {
  if (window.lazyLoadObserver) {
    window.lazyLoadObserver.disconnect();
    window.lazyLoadObserver = null;
  }
}

// ✅ Add cleanup on page visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cleanup();
  }
});

// ✅ Add cleanup on page unload
window.addEventListener('beforeunload', cleanup);