import { loadComponent } from './utils.js';
import { BASE_PATH } from './config.js';

export async function loadLayoutComponents() {
  try {
    const [header, footer] = await Promise.all([
      loadComponent(`${BASE_PATH}components/header.html`, 'header-container'),
      loadComponent(`${BASE_PATH}components/footer.html`, 'footer-container')
    ]);

    if (!header || !footer) {
      throw new Error('Failed to load layout components');
    }

    initMobileMenu();
    updateCopyrightYear();
    
  } catch (error) {
    console.error('Component loading error:', error);
    loadFallbackLayout();
  }
}

// ... rest of your existing component.js code remains the same ...

function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.nav-menu').classList.toggle('active');
    });
  }
}

function updateCopyrightYear() {
  const yearElements = document.querySelectorAll('[data-current-year]');
  yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

function loadFallbackLayout() {
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  
  if (headerContainer && !headerContainer.innerHTML.trim()) {
    headerContainer.innerHTML = `
      <header class="default-header">
        <a href="/" class="logo">Ecoviron</a>
        <nav class="nav-menu">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/products">Products</a>
        </nav>
      </header>
    `;
  }

  if (footerContainer && !footerContainer.innerHTML.trim()) {
    footerContainer.innerHTML = `
      <footer class="default-footer">
        <p>© <span data-current-year></span> Ecoviron. All rights reserved.</p>
      </footer>
    `;
    updateCopyrightYear();
  }
}