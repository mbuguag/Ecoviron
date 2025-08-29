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
 * Clone desktop nav into mobile nav and add accordion behavior for submenus
 */
function cloneDesktopNavToMobile() {
  const desktopNav = document.querySelector(".header-nav");
  const mobileNav = document.querySelector(".mobile-nav");

  if (!desktopNav || !mobileNav) return;
  if (mobileNav.dataset.cloned === "true") return; // avoid duplicates

  const clonedList = desktopNav.cloneNode(true);
  clonedList.classList.remove("header-nav");
  clonedList.classList.add("mobile-nav-list");

  // clear existing content
  mobileNav.innerHTML = "";
  mobileNav.appendChild(clonedList);

  // handle dropdowns -> make accordion style
  const submenuParents = clonedList.querySelectorAll("li:has(ul)");
  submenuParents.forEach((li) => {
    const submenu = li.querySelector("ul");
    if (!submenu) return;

    // create a toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("submenu-toggle");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = "▾"; // simple caret; replace with icon if needed

    // insert toggle button after the link
    const link = li.querySelector("a");
    if (link) {
      link.after(toggleBtn);
    }

    submenu.style.display = "none"; // hidden by default

    toggleBtn.addEventListener("click", () => {
      const isOpen = submenu.style.display === "block";
      submenu.style.display = isOpen ? "none" : "block";
      toggleBtn.setAttribute("aria-expanded", String(!isOpen));
      toggleBtn.innerHTML = isOpen ? "▾" : "▴";
    });
  });

  mobileNav.dataset.cloned = "true";
  console.log("[layout] Desktop nav cloned into mobile nav with accordion ✅");
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
