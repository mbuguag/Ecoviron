export async function loadLayoutComponents() {
  try {
    // Use Promise.all to load components in parallel
    const [headerHtml, footerHtml] = await Promise.all([
      loadComponent('../components/header.html', `header-container`),
      loadComponent('../components/footer.html', `footer-container`)
    ]);

    // Only update DOM if content was received
    const headerContainer = document.getElementById('header-container') || 
                          document.getElementById('header-placeholder');
    const footerContainer = document.getElementById('footer-container') || 
                          document.getElementById('footer-placeholder');

    if (headerHtml && headerContainer) {
      headerContainer.innerHTML = headerHtml;
      initHeaderScripts(); // Initialize any header-specific JS
    }

    if (footerHtml && footerContainer) {
      footerContainer.innerHTML = footerHtml;
      initFooterScripts(); // Initialize any footer-specific JS
    }

  } catch (error) {
    console.error('Failed to load layout components:', error);
    loadFallbackLayout();
  }
}

// Helper function to load individual components
async function loadComponent(url) {
  try {
    const response = await fetch(resolvePath(url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
    return null;
  }
}

// Path resolution for different environments
function resolvePath(relativePath) {
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }
  // Adjust base path for your project structure
  const basePath = window.location.pathname.includes('/Frontend') ? '/Frontend' : '';
  return `${basePath}/${relativePath}`;
}

// Initialize any header interactivity
function initHeaderScripts() {
  // Mobile menu toggle example
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.nav-menu').classList.toggle('active');
    });
  }
}

// Initialize footer content
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