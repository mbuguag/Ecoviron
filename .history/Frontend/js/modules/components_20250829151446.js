

import {
  BASE_PATH,
  getAssetPath,
  loadComponents
} from '../apiConfig.js';

// Layout state
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
  if (layoutState.initialized) return true; // prevent duplicate loads

  domCache.header = document.getElementById('header-container');
  domCache.footer = document.getElementById('footer-container');

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
    return true;

  } catch (err) {
    console.error('Layout loading failed, using fallbacks', err);
    loadFallbackHeader();
    loadFallbackFooter();
    initFeatures();
    layoutState.initialized = true;
    return false;
  }
}

/**
 * Initialize layout features
 */
function initFeatures() {
  if (layoutState.featuresInitialized) return;

  cacheInteractiveElements();
  initMobileMenu();
  initSmoothScroll();
  initLazyLoading();
  updateCopyright();

  layoutState.featuresInitialized = true;
}
/**
 * Cache interactive elements
 */
function cacheInteractiveElements() {
  domCache.menuToggle = document.querySelector('.mobile-menu-toggle');
  domCache.navMenu = document.querySelector('.nav-menu');
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector('.header-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.menu-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggle || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('active');
    overlay?.classList.add('active');
    document.body.classList.add('menu-open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileNav.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isActive = mobileNav.classList.contains('active');
    isActive ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);
}


/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
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
  });
}

/**
 * Lazy loading
 */
function initLazyLoading() {
  const lazyItems = document.querySelectorAll('[data-src], [data-srcset]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
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
        observer.unobserve(el);
      }
    });
  });

  lazyItems.forEach(el => observer.observe(el));
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

// Auto-init (only once)
// document.addEventListener('DOMContentLoaded', () => {
//   loadLayoutComponents();
// });