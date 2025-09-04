// js/header.js

/**
 * Sticky Header
 */
/**
 * Header & Mobile Menu Toggle
 */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".header-menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavClose = document.querySelector(".mobile-nav-close");
  const overlay = document.querySelector(".menu-overlay");

  if (!menuToggle || !mobileNav || !overlay) return;

  // Open mobile nav
  function openMenu() {
    mobileNav.classList.add("active");
    overlay.classList.add("active");
    menuToggle.classList.add("active");  
    menuToggle.setAttribute("aria-expanded", "true");
  }

  // Close mobile nav
  function closeMenu() {
    mobileNav.classList.remove("active");
    overlay.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // Toggle button
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.contains("active");
    isOpen ? closeMenu() : openMenu();
  });

  // Close button
  if (mobileNavClose) {
    mobileNavClose.addEventListener("click", closeMenu);
  }

  // Overlay click closes
  overlay.addEventListener("click", closeMenu);

  // Escape key closes
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && mobileNav.classList.contains("active")) {
      closeMenu();
    }
  });
});

// Mobile dropdowns
document.querySelectorAll(".mobile-nav .dropdown > a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault(); // prevent navigation on parent
    const parent = link.parentElement;
    parent.classList.toggle("active");
  });
});


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
