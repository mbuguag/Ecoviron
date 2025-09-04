// js/header.js

/**
 * Sticky Header
 */

export function initStickyHeader() {
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
  toggleSticky(); // run once on load
}

/**
 * Mobile menu toggle
 */
export function initMobileMenu() {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", () => {
    const active = navMenu.classList.toggle("active");
    menuToggle.classList.toggle("active", active);
    document.body.classList.toggle("menu-open", active);
    menuToggle.setAttribute("aria-expanded", active);
  });
}

/**
 * Smooth scroll for anchor links
 */
export function initSmoothScroll() {
  document.addEventListener("click", e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      document.querySelector(".nav-menu")?.classList.remove("active");
      document.querySelector(".mobile-menu-toggle")?.classList.remove("active");
    }
  });
}

/**
 * Initialize all header features
 */
export function initHeaderFeatures() {
  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
}
