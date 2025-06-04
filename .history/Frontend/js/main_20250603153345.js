// Path resolution system tailored for services structure
function resolvePath(relativePath) {
  // Don't modify absolute paths or external URLs
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  const currentPath = window.location.pathname;
  const inServicesFolder = currentPath.includes('/services/');
  const isServiceLandingPage = currentPath.endsWith('/services.html') || currentPath.endsWith('/services/');

  // Handle relative links inside services pages
  if (inServicesFolder) {
    if (relativePath.endsWith('.html') && !relativePath.includes('/')) {
      return relativePath;
    }
    if (relativePath.startsWith('assets/')) {
      return '../' + relativePath;
    }
  }

  // Compute path depth safely
  const pathParts = currentPath.split('/').filter(part => part && !part.endsWith('.html'));
  const depth = pathParts.length - 1;
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
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const linkPath = href.split('/').pop();

    const isExactMatch = linkPath === currentPage;
    const isServiceRoot = currentPage === 'services.html' && href.includes('services.html');
    const isServiceSubpage = currentPath.includes('/services/') && href === 'services.html';

    link.classList.toggle('active', isExactMatch || isServiceRoot || isServiceSubpage);
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
    <div class="service-card" style="opacity:0;">
      <a href="${service.link}" aria-label="Learn more about ${service.title}">
        <img src="${resolvePath(service.icon)}" alt="${service.title}" onerror="this.src='${resolvePath('assets/icons/fallback-icon.png')}'">
        <h3>${service.title}</h3>
        <p>${service.excerpt}</p>
        <span class="service-link">Learn more →</span>
      </a>
    </div>
  `).join('');

  // Animate cards on load
  const cards = servicesGrid.querySelectorAll('.service-card');
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease';
      card.style.opacity = 1;
    }, i * 100);
  });
}

// Initialize Service Detail Page - for individual service pages
function initializeServiceDetail() {
  const serviceContent = document.querySelector('.service-content');
  if (!serviceContent) return;

  const backLink = document.createElement('a');
  backLink.href = 'services.html';
  backLink.className = 'back-to-services';
  backLink.innerHTML = '← Back to All Services';
  backLink.setAttribute('aria-label', 'Go back to all services');
  serviceContent.prepend(backLink);
}

// Main initialization
window.addEventListener('DOMContentLoaded', () => {
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  if (document.querySelector('.services-grid')) {
    initializeServicesGrid();
  } else if (document.querySelector('.service-content')) {
    initializeServiceDetail();
  }
});
