import { loadComponent, resolvePath, getAssetPath, formatPrice } from "./modules/Utils.js";

export async function loadLayoutComponents() {
  try {
   
    const [headerHtml, footerHtml] = await Promise.all([
      loadComponent('../components/header.html', `header-container`),
      loadComponent('../components/footer.html', `footer-container`)
    ]);

    
    const headerContainer = document.getElementById('header-container') || 
                          document.getElementById('header-placeholder');
    const footerContainer = document.getElementById('footer-container') || 
                          document.getElementById('footer-placeholder');

    if (headerHtml && headerContainer) {
      headerContainer.innerHTML = headerHtml;
      initHeaderScripts();
    }

    if (footerHtml && footerContainer) {
      footerContainer.innerHTML = footerHtml;
      initFooterScripts();
    }

  } catch (error) {
    console.error('Failed to load layout components:', error);
    loadFallbackLayout();
  }
}




function initHeaderScripts() {
  // Mobile menu toggle example
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.nav-menu').classList.toggle('active');
    });
  }
}


function initFooterScripts() {
  // Update copyright year automatically
  const yearElement = document.getElementById('currentYear') || 
                     document.querySelector('.current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Fallback when components fail to load
function loadFallbackLayout() {
  const headerContainer = document.getElementById('header-container') || 
                         document.getElementById('header-placeholder');
  const footerContainer = document.getElementById('footer-container') || 
                         document.getElementById('footer-placeholder');

  if (headerContainer && !headerContainer.innerHTML) {
    headerContainer.innerHTML = `
      <header class="default-header">
        <a href="/" class="logo">Ecoviron</a>
        <nav>
          <a href="/">Home</a>
          <a href="/services">Services</a>
        </nav>
      </header>
    `;
  }

  if (footerContainer && !footerContainer.innerHTML) {
    footerContainer.innerHTML = `
      <footer class="default-footer">
        <p>© ${new Date().getFullYear()} Ecoviron Environmental Consultancy</p>
      </footer>
    `;
  }
}