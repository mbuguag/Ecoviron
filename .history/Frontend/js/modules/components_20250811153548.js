import { loadComponent, BASE_PATH } from './Utils.js';

export async function loadLayoutComponents() {
  try {
    // Use BASE_PATH from Utils.js for consistent path resolution
    const componentsBasePath = `${BASE_PATH}components/`;
    
    const [headerLoaded, footerLoaded] = await Promise.all([
      loadComponent(`${componentsBasePath}header.html`, "header-container"),
      loadComponent(`${componentsBasePath}footer.html`, "footer-container")
    ]);

    if (!headerLoaded || !footerLoaded) {
      throw new Error("Failed to load layout components");
    }

    // Initialize component-specific functionality
    initMobileMenu();
    updateCopyrightYear();
    
    return true;
  } catch (error) {
    console.error("Component loading error:", error);
    loadFallbackLayout();
    return false;
  }
}

function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu) {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
        document.querySelector('.nav-menu')?.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }
}

function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

function loadFallbackLayout() {
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  
  // Only load fallback if containers exist and are empty
  if (headerContainer && !headerContainer.innerHTML.trim()) {
    headerContainer.innerHTML = `
      <header class="default-header">
        <a href="${BASE_PATH}" class="logo">Ecoviron</a>
        <button class="mobile-menu-toggle">☰</button>
        <nav class="nav-menu">
          <a href="${BASE_PATH}">Home</a>
          <a href="${BASE_PATH}services">Services</a>
          <a href="${BASE_PATH}products">Products</a>
          <a href="${BASE_PATH}about">About</a>
          <a href="${BASE_PATH}contact">Contact</a>
        </nav>
      </header>
    `;
  }

  if (footerContainer && !footerContainer.innerHTML.trim()) {
    footerContainer.innerHTML = `
      <footer class="default-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Quick Links</h3>
            <a href="${BASE_PATH}">Home</a>
            <a href="${BASE_PATH}services">Services</a>
            <a href="${BASE_PATH}products">Products</a>
          </div>
          <div class="footer-section">
            <h3>Legal</h3>
            <a href="${BASE_PATH}privacy">Privacy Policy</a>
            <a href="${BASE_PATH}terms">Terms of Service</a>
          </div>
        </div>
        <p class="copyright">© <span data-current-year></span> Ecoviron. All rights reserved.</p>
      </footer>
    `;
    updateCopyrightYear();
  }
  
  // Initialize mobile menu for fallback UI
  initMobileMenu();
}