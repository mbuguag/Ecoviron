// modules/components.js
import { BASE_PATH } from "../apiConfig.js";

export async function loadComponents() {
  await Promise.all([loadHeader(), loadFooter()]);
}

/* ------------------ HEADER ------------------ */
async function loadHeader() {
  try {
    const response = await fetch(`${BASE_PATH}components/header.html`);
    if (!response.ok) throw new Error("Header not found");

    let html = await response.text();
    html = html.replace(/\$\{BASE_PATH\}/g, BASE_PATH);

    const placeholder = document.querySelector("header");
    if (placeholder) placeholder.outerHTML = html;

    // Attach header styles
    loadCSS(`${BASE_PATH}css/header.css`);

    // Init header behaviors
    initHeader();
  } catch (err) {
    console.error("Failed to load header:", err);
  }
}

/* ------------------ FOOTER ------------------ */
async function loadFooter() {
  try {
    const response = await fetch(`${BASE_PATH}components/footer.html`);
    if (!response.ok) throw new Error("Footer not found");

    let html = await response.text();
    html = html.replace(/\$\{BASE_PATH\}/g, BASE_PATH);

    const placeholder = document.querySelector("footer");
    if (placeholder) placeholder.outerHTML = html;

    // Optionally load footer CSS if you have one
    // loadCSS(`${BASE_PATH}css/footer.css`);
  } catch (err) {
    console.error("Failed to load footer:", err);
  }
}

/* ------------------ HEADER BEHAVIOR ------------------ */
function initHeader() {
  // Mobile menu toggle
  const menuToggle = document.querySelector(".header-menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const overlay = document.querySelector(".menu-overlay");
  const closeBtn = document.querySelector(".mobile-nav-close");

  if (menuToggle && mobileNav && overlay && closeBtn) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.add("open");
      overlay.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
    });

    const closeMenu = () => {
      mobileNav.classList.remove("open");
      overlay.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
  }

  // Auth dropdown toggle
  document.querySelectorAll(".header-auth-item .header-nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const dropdown = link.closest(".header-auth-item").querySelector(".dropdown-content");
      dropdown.classList.toggle("show");
    });
  });

  // Close auth dropdown when clicking outside
  document.addEventListener("click", e => {
    if (!e.target.closest(".header-auth-item")) {
      document.querySelectorAll(".header-auth-item .dropdown-content").forEach(dc => {
        dc.classList.remove("show");
      });
    }
  });

  // TODO: Replace with real auth state logic later
  initAuthArea();
}

/* ------------------ AUTH STATE ------------------ */
function initAuthArea() {
  const loggedIn = false; // TODO: connect with your real auth logic

  const loginLinks = document.querySelectorAll(".auth-login-link");
  const registerLinks = document.querySelectorAll(".auth-register-link");
  const profileLinks = document.querySelectorAll(".auth-profile-link");
  const logoutLinks = document.querySelectorAll(".auth-logout-link");

  if (loggedIn) {
    loginLinks.forEach(el => (el.style.display = "none"));
    registerLinks.forEach(el => (el.style.display = "none"));
    profileLinks.forEach(el => (el.style.display = "block"));
    logoutLinks.forEach(el => (el.style.display = "block"));
  } else {
    loginLinks.forEach(el => (el.style.display = "block"));
    registerLinks.forEach(el => (el.style.display = "block"));
    profileLinks.forEach(el => (el.style.display = "none"));
    logoutLinks.forEach(el => (el.style.display = "none"));
  }
}

/* ------------------ HELPERS ------------------ */
function loadCSS(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
