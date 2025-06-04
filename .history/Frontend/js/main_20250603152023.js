// Path resolution system tailored for services structure
function resolvePath(relativePath) {
  // Don't modify absolute paths or external URLs
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  // Get current path depth
  const currentPath = window.location.pathname;
  const inServicesFolder = currentPath.includes('/services/');
  const isServiceLandingPage = currentPath.endsWith('/services.html') || currentPath.endsWith('/services/');

  // Special cases for services pages
  if (inServicesFolder) {
    // Links from service pages to other service pages (same folder)
    if (relativePath.endsWith('.html') && !relativePath.includes('/')) {
      return relativePath;
    }
    
    // Links from service pages to assets (images, etc.)
    if (relativePath.startsWith('assets/')) {
      return '../' + relativePath;
    }
  }

  // Default handling for other cases
  const depth = currentPath.split('/').filter(part => part && !part.endsWith('.html')).length - 1;
  return (depth > 0 ? '../'.repeat(depth) : '') + relativePath;
}

// Load components with error handling
async function loadComponent(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
      if (containerId === 'header-container') {
        highlightCurrentService();
      }
    }
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
  }
}

// Highlight current service in nav
function highlightCurrentService() {
  const navLinks = document.querySelectorAll('.nav-menu a');
  const currentPage = window.location.pathname.split('/').pop();
  
  navLinks.forEach(link => {
    link.classList.toggle({'active',
      link.getAttribute('href') === currentPage ||
      (currentPage === 'services.html' && link.getAttribute('href').includes('services.html')) ||
      (currentPage !== 'services.html' && currentPage.endsWith('.html') && 
       link.getAttribute('href').includes('services.html'))
  });
}

// Initialize Services Grid - for services.html landing page
function initializeServicesGrid() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const services = [
    {
      title: "Environmental Impact Assessments",
      excerpt: "Compliant EIAs meeting NEMA regulations",
      icon: "assets/icons/eia-icon.png",
      link: "eia.html"
    },
    {
      title: "Environmental Audits",
      excerpt: "Comprehensive compliance audits",
      icon: "assets/icons/audit-icon.png",
      link: "audits.html"
    },
    {
      title: "Sustainability Reporting",
      excerpt: "ESG reports and frameworks",
      icon: "assets/icons/sustainability-icon.png",
      link: "sustainability.html"
    },
    {
      title: "ISO Certification",
      excerpt: "ISO 14001, 45001 support",
      icon: "assets/icons/iso-icon.png",
      link: "iso-certification.html"
    }
  ];

  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card">
      <a href="${service.link}">
        <img src="${resolvePath(service.icon)}" alt="${service.title}">
        <h3>${service.title}</h3>
        <p>${service.excerpt}</p>
        <span class="service-link">Learn more →</span>
      </a>
    </div>
  `).join('');
}

// Initialize Service Detail Page - for individual service pages
function initializeServiceDetail() {
  const serviceContent = document.querySelector('.service-content');
  if (!serviceContent) return;

  // Add back to services link
  const backLink = document.createElement('a');
  backLink.href = 'services.html';
  backLink.className = 'back-to-services';
  backLink.innerHTML = '← Back to All Services';
  serviceContent.prepend(backLink);
}

// Main initialization
window.addEventListener('DOMContentLoaded', () => {
  // Load reusable components
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  // Initialize features based on page
  if (document.querySelector('.services-grid')) {
    initializeServicesGrid(); // Services landing page
  } else if (document.querySelector('.service-content')) {
    initializeServiceDetail(); // Individual service page
  }
});