// js/header.js

/**
 * Header Interactions
 * - Sticky header
 * - Mobile menu toggle
 * - Dropdown expand/collapse
 * - Smooth scroll
 */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".header-menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavClose = document.querySelector(".mobile-nav-close");
  const overlay = document.querySelector(".menu-overlay");

  if (menuToggle && mobileNav && overlay) {
    // Open menu
    function openMenu() {
      mobileNav.classList.add("active");
      overlay.classList.add("active");
      menuToggle.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden"; // prevent background scroll
    }

    // Close menu
    function closeMenu() {
      mobileNav.classList.remove("active");
      overlay.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = ""; // restore scroll
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

    // Mobile dropdowns
    mobileNav.querySelectorAll(".dropdown > a").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        link.parentElement.classList.toggle("active");
      });
    });
  }

  // Initialize sticky header + smooth scroll
  initStickyHeader();
  initSmoothScroll();
});

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

      // Close menu after navigating
      document.querySelector(".mobile-nav")?.classList.remove("active");
      document.querySelector(".header-menu-toggle")?.classList.remove("active");
      document.querySelector(".menu-overlay")?.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

/**
 * Initialize all header features (optional external call)
 */
export function initHeaderFeatures() {
  initStickyHeader();
  initSmoothScroll();
}
