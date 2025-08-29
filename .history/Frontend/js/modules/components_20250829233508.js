// components.js (consolidated with dropdown cloning + accordion for mobile nav)
import { BASE_PATH, getAssetPath } from "../apiConfig.js";

function initLayoutFeatures() {
  initMobileMenu();
  initSmoothScroll();
  initLazyLoading();
  updateCopyright();
  initStickyHeader();
  cloneDesktopNavToMobile();

  console.log("[layout] Header, footer, and layout features initialized ✅");
}

/**
 * Sticky Header
 */
function initStickyHeader() {
  const headerEl = document.querySelector(".site-header");
  if (!headerEl) return;

  const stickyClass = "sticky";
  const threshold = 100;

  function toggleSticky() {
    if (window.scrollY > threshold) {
      headerEl.classList.add(stickyClass);
      document.body.classList.add("has-sticky");
    } else {
      headerEl.classList.remove(stickyClass);
      document.body.classList.remove("has-sticky");
    }
  }

  window.addEventListener("scroll", toggleSticky);
  toggleSticky();
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector(".header-menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const overlay = document.querySelector(".menu-overlay");

  if (!toggle || !mobileNav || !overlay) return;

  function openMenu() {
    mobileNav.classList.add("active", "nav-open");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    mobileNav.classList.remove("active", "nav-open");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    mobileNav.classList.contains("active") ? closeMenu() : openMenu();
  }

  toggle.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav.classList.contains("active")) {
      closeMenu();
    }
  });

  console.log("[layout] Mobile menu initialized ✅");
}
/**
 * Smooth scroll for anchors
 */
function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/**
 * Lazy loading images
 */
function initLazyLoading() {
  const lazyItems = document.querySelectorAll("[data-src], [data-srcset]");
  if (!("IntersectionObserver" in window) || lazyItems.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute("data-src");
        }
        if (el.dataset.srcset) {
          el.srcset = el.dataset.srcset;
          el.removeAttribute("data-srcset");
        }
        observer.unobserve(el);
      }
    });
  });

  lazyItems.forEach((el) => observer.observe(el));
}

/**
 * Copyright updater
 */
function updateCopyright() {
  const year = new Date().getFullYear();
  document
    .querySelectorAll("[data-current-year]")
    .forEach((el) => (el.textContent = year));
}

export { initLayoutFeatures };

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.header-menu-toggle');
    const mobileNav = document.querySelector('.desktop-nav');
    const overlay = document.querySelector('.menu-overlay');
    const body = document.body;

    menuToggle.addEventListener('click', function() {
        const isActive = mobileNav.classList.contains('active');
        
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('nav-open');
        
        // Update aria-expanded
        menuToggle.setAttribute('aria-expanded', !isActive);
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});