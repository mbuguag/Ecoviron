import { BASE_PATH } from "../apiConfig.js";

// Helper: dynamically inject CSS
function loadCSS(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

// Init header interactions
function initHeader() {
  console.log("Initializing header...");

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

  // Close dropdown if clicking outside
  document.addEventListener("click", e => {
    if (!e.target.closest(".header-auth-item")) {
      document.querySelectorAll(".header-auth-item .dropdown-content").forEach(dc => {
        dc.classList.remove("show");
      });
    }
  });

  // Setup auth state (stub, integrate with real login later)
  initAuthArea();
}

function initAuthArea() {
  const loggedIn = false; // TODO: replace with real auth state

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

/**
 * Load components dynamically (header, footer, etc.)
 * @param {Array} components - Array of { fileName, containerId }
 */
export async function loadComponents(components = [
  { fileName: "header.html", containerId: "header-container" },
  { fileName: "footer.html", containerId: "footer-container" }
]) {
  for (const { fileName, containerId } of components) {
    try {
      const response = await fetch(`${BASE_PATH}components/${fileName}`);
      if (!response.ok) throw new Error(`Failed to load ${fileName}`);

      let html = await response.text();

      // 🔹 Replace placeholders
      html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
      html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);

      const container = document.getElementById(containerId);
      if (container) container.innerHTML = html;

      // 🔹 Auto-apply component-specific CSS/JS
      if (fileName === "header.html") {
        loadCSS(`${BASE_PATH}css/header.css`);
        initHeader();
      } else if (fileName === "footer.html") {
        loadCSS(`${BASE_PATH}css/footer.css`);
      }

    } catch (err) {
      console.error(`Error loading ${fileName}:`, err);
    }
  }
}

