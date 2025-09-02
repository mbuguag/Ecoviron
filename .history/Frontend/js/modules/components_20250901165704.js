// ==================
// components.js - Anti-Glitch Version
// ==================
import { BASE_PATH, getAssetPath, loadComponents } from "../apiConfig.js";

const layoutState = { 
  initialized: false, 
  headerLoaded: false, 
  footerLoaded: false,
  isInitializing: false
};

const domCache = { 
  header: null, 
  footer: null, 
  menuToggle: null, 
  navMenu: null,
  mobileNav: null,
  overlay: null
};

// Debounce utility to prevent excessive calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Load layout (header + footer) with anti-glitch measures
 */
export async function loadLayoutComponents() {
  if (layoutState.initialized) return true;
  if (layoutState.isInitializing) return false;
  
  layoutState.isInitializing = true;

  domCache.header = document.getElementById("header-container");
  domCache.footer = document.getElementById("footer-container");

  // Pre-populate containers to prevent layout shift
  prePopulateContainers();

  try {
    const results = await loadComponents([
      { fileName: "header.html", containerId: "header-container" },
      { fileName: "footer.html", containerId: "footer-container" }
    ]);

    layoutState.headerLoaded = results["header.html"];
    layoutState.footerLoaded = results["footer.html"];

    if (!layoutState.headerLoaded) loadFallbackHeader();
    if (!layoutState.footerLoaded) loadFallbackFooter();

    // Wait a bit to ensure DOM is stable before initializing features
    await new Promise(resolve => setTimeout(resolve, 100));
    
    initFeatures();
    layoutState.initialized = true;
    layoutState.isInitializing = false;
    
    // Trigger a custom event to notify other components
    document.dispatchEvent(new CustomEvent('layoutComponentsLoaded', {
      detail: { headerLoaded: layoutState.headerLoaded, footerLoaded: layoutState.footerLoaded }
    }));
    
    return true;
  } catch (err) {
    console.error("Layout loading failed, using fallbacks", err);
    loadFallbackHeader();
    loadFallbackFooter();
    initFeatures();
    layoutState.isInitializing = false;
    return false;
  }
}

/**
 * Pre-populate containers to prevent content jumping
 */
function prePopulateContainers() {
  if (domCache.header && !domCache.header.innerHTML.trim()) {
    domCache.header.innerHTML = `
      <div class="skeleton skeleton-header" style="height: 70px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 100%;">
          <div style="width: 120px; height: 20px; background: rgba(255,255,255,0.3); border-radius: 4px;"></div>
          <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.3); border-radius: 4px;"></div>
        </div>
      </div>
    `;
  }
  
  if (domCache.footer && !domCache.footer.innerHTML.trim()) {
    domCache.footer.innerHTML = `
      <div class="skeleton skeleton-footer" style="height: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;">
        <div style="padding: 40px 20px; text-align: center;">
          <div style="width: 200px; height: 16px; background: rgba(255,255,255,0.3); border-radius: 4px; margin: 0 auto 10px;"></div>
          <div style="width: 150px; height: 12px; background: rgba(255,255,255,0.3); border-radius: 4px; margin: 0 auto;"></div>
        </div>
      </div>
    `;
  }
  
  // Add shimmer animation if not already present
  if (!document.querySelector('#shimmer-animation')) {
    const style = document.createElement('style');
    style.id = 'shimmer-animation';
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Init interactive features with better error handling
 */
function initFeatures() {
  cacheInteractiveElements();
  initMobileMenu();
  initSmoothScroll();
  initLazyLoading();
  updateCopyright();
  initHeaderScrollEffects();
  
  // Clean up any remaining skeletons
  setTimeout(cleanupSkeletons, 500);
}

function cleanupSkeletons() {
  const skeletons = document.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => {
    if (skeleton.parentElement?.querySelector(':not(.skeleton)')) {
      skeleton.remove();
    }
  });
}

function cacheInteractiveElements() {
  // Use a more resilient approach to cache elements
  const cacheElement = (selector, key) => {
    const element = document.querySelector(selector);
    if (element) domCache[key] = element;
    return element;
  };

  cacheElement(".header-menu-toggle", "menuToggle");
  cacheElement(".mobile-nav", "mobileNav");
  cacheElement(".menu-overlay", "overlay");
  cacheElement(".desktop-nav", "navMenu");
}

/**
 * Enhanced mobile menu with better state management
 */
function initMobileMenu() {
  // Wait for DOM to be fully ready
  const tryInitMobileMenu = () => {
    const toggle = document.querySelector(".header-menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const overlay = document.querySelector(".menu-overlay");
    const closeBtn = document.querySelector(".mobile-nav-close");

    if (!toggle || !mobileNav) {
      // Retry after a short delay if elements aren't ready
      setTimeout(tryInitMobileMenu, 100);
      return;
    }

    // Ensure proper initial state
    toggle.setAttribute("aria-expanded", "false");
    
    let isMenuOpen = false;

    const openMenu = () => {
      if (isMenuOpen) return;
      
      isMenuOpen = true;
      mobileNav.classList.add("active");
      overlay?.classList.add("active");
      document.body.classList.add("menu-open");
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      
      // Focus management
      const firstFocusable = mobileNav.querySelector('a, button');
      firstFocusable?.focus();
    };

    const closeMenu = () => {
      if (!isMenuOpen) return;
      
      isMenuOpen = false;
      mobileNav.classList.remove("active");
      overlay?.classList.remove("active");
      document.body.classList.remove("menu-open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      
      // Return focus
      toggle.focus();
    };

    // Event listeners with proper cleanup
    const toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isMenuOpen ? closeMenu() : openMenu();
    };

    const overlayHandler = (e) => {
      e.preventDefault();
      closeMenu();
    };

    const closeHandler = (e) => {
      e.preventDefault();
      closeMenu();
    };

    const escapeHandler = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    // Remove any existing listeners first
    toggle.removeEventListener("click", toggleHandler);
    overlay?.removeEventListener("click", overlayHandler);
    closeBtn?.removeEventListener("click", closeHandler);
    document.removeEventListener("keydown", escapeHandler);

    // Add new listeners
    toggle.addEventListener("click", toggleHandler);
    overlay?.addEventListener("click", overlayHandler);
    closeBtn?.addEventListener("click", closeHandler);
    document.addEventListener("keydown", escapeHandler);

    // Close menu on window resize (mobile -> desktop)
    const resizeHandler = debounce(() => {
      if (window.innerWidth > 768 && isMenuOpen) {
        closeMenu();
      }
    }, 250);

    window.addEventListener("resize", resizeHandler);

    console.log("✅ Mobile menu initialized");
  };

  tryInitMobileMenu();
}

/**
 * Enhanced header scroll effects
 */
function initHeaderScrollEffects() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let isScrolled = false;
  let ticking = false;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const shouldBeScrolled = scrollY > 50;

    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      
      if (isScrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  };

  const throttledScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', throttledScroll, { passive: true });
}

/**
 * Smooth scroll with better performance
 */
function initSmoothScroll() {
  const handleSmoothScroll = (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    
    if (target) {
      e.preventDefault();
      
      // Close mobile menu if open
      const mobileNav = document.querySelector('.mobile-nav');
      const toggle = document.querySelector('.header-menu-toggle');
      
      if (mobileNav?.classList.contains('active')) {
        mobileNav.classList.remove('active');
        document.querySelector('.menu-overlay')?.classList.remove('active');
        document.body.classList.remove('menu-open');
        toggle?.classList.remove('active');
        toggle?.setAttribute('aria-expanded', 'false');
      }
      
      // Smooth scroll
      target.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  document.addEventListener("click", handleSmoothScroll);
}

/**
 * Enhanced lazy loading with better performance
 */
function initLazyLoading() {
  if (!("IntersectionObserver" in window)) {
    // Fallback for older browsers
    document.querySelectorAll("[data-src], [data-srcset]").forEach(el => {
      if (el.dataset.src) el.src = el.dataset.src;
      if (el.dataset.srcset) el.srcset = el.dataset.srcset;
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute("data-srcset");
        }
        
        img.classList.add('lazy-loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  document.querySelectorAll("[data-src], [data-srcset]").forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Copyright update
 */
function updateCopyright() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = year;
  });
}

/**
 * Enhanced fallbacks with better styling
 */
function loadFallbackHeader() {
  if (!domCache.header) return;
  
  domCache.header.innerHTML = `
    <header class="fallback-header" style="
      background: #2c5f2d;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <div style="
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <a href="${BASE_PATH}" style="
          color: white;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.5rem;
        ">
          BIONIX-EHS
        </a>
        <nav style="display: flex; gap: 1rem;">
          <a href="${BASE_PATH}index.html" style="color: white; text-decoration: none;">Home</a>
          <a href="${BASE_PATH}about.html" style="color: white; text-decoration: none;">About</a>
          <a href="${BASE_PATH}services/services.html" style="color: white; text-decoration: none;">Services</a>
          <a href="${BASE_PATH}contact.html" style="color: white; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>`;
}

function loadFallbackFooter() {
  if (!domCache.footer) return;
  
  const year = new Date().getFullYear();
  domCache.footer.innerHTML = `
    <footer class="fallback-footer" style="
      background: #1a4c1a;
      color: white;
      text-align: center;
      padding: 2rem 1rem;
      margin-top: 2rem;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h3 style="margin: 0 0 1rem;">BIONIX-EHS</h3>
        <p style="margin: 0 0 1rem;">Environmental Consultancy Services</p>
        <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">
          © ${year} BIONIX-EHS. All rights reserved.
        </p>
      </div>
    </footer>`;
}

// Enhanced auto-initialization
let initializationAttempts = 0;
const maxInitAttempts = 5;

const tryInitialization = () => {
  initializationAttempts++;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayoutComponents, { once: true });
  } else {
    loadLayoutComponents();
  }