// Load reusable components
function loadComponent(url, containerId) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      return res.text();
    })
    .then(data => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = data;
      
      // After loading header, set active nav link
      if (containerId === 'header-container') {
        setActiveNavLink();
      }
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// Set active navigation link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (currentPage === linkPage || 
        (currentPage === 'index.html' && linkPage === '/') ||
        (currentPage.startsWith('services/') && linkPage === 'services.html')) {
      link.classList.add('active');
    }
  });
}

// Simplified path resolution system
function resolvePath(relativePath) {
  // Don't modify paths that are already absolute or have protocol
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  // Get current path depth (number of folders deep we are)
  const pathParts = window.location.pathname.split('/').filter(part => part && part !== 'index.html');
  const depth = pathParts.length - 1;

  // Special handling for components which are always in root/components/
  if (relativePath.startsWith('components/')) {
    return (depth > 0 ? '../' : '') + relativePath;
  }

  // Handle parent directory references that already exist
  if (relativePath.startsWith('../')) {
    return relativePath;
  }

  // For services pages, adjust path if we're already in services folder
  if (window.location.pathname.includes('/services/') && 
      !relativePath.startsWith('services/') &&
      !relativePath.includes('../')) {
    return relativePath; // Links within services folder don't need adjustment
  }

  // For all other relative paths, prepend appropriate ../ based on depth
  return (depth > 0 ? '../' : '') + relativePath;
}

// Main DOM ready handler
window.addEventListener('DOMContentLoaded', () => {
  // Load header and footer with proper paths
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  // Initialize features based on current page
  if (document.getElementById('carousel-slide')) {
    initializeCarousel();
  }
  
  if (document.querySelector('.services-grid')) {
    initializeServicesGrid();
  }

  // Initialize service details if on a service detail page
  if (document.querySelector('.service-detail')) {
    initializeServiceDetail();
  }
});

function initializeCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Reedbed Wastewater System", image: "assets/images/reedbed-wastewater.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    { title: "Safety Officer Inspection", image: "assets/images/officer-inspection.png" },
    { title: "Small Water Accessories", image: "assets/images/water-accessories.png" },
    { title: "Workplace Safety Inspection", image: "assets/images/workplace-safety.png" }
  ];

  // Clear existing slides (if any)
  carouselSlide.innerHTML = '';

  // Create carousel slides
  services.forEach(service => {
    const slide = document.createElement("div");
    slide.className = "carousel-item";
    slide.innerHTML = `
      <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
      <h3>${service.title}</h3>
    `;
    carouselSlide.appendChild(slide);
  });

  let index = 0;
  const totalSlides = services.length;

  function showSlide(i) {
    carouselSlide.style.transform = `translateX(-${i * 100}%)`;
  }

  showSlide(index); // initial load

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % totalSlides;
      showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + totalSlides) % totalSlides;
      showSlide(index);
    });

    const intervalId = setInterval(() => {
      index = (index + 1) % totalSlides;
      showSlide(index);
    }, 5000);

    // Cleanup interval when leaving page
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });
  }
}

function initializeServicesGrid() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const consultancyServices = [
    {
      title: "Environmental Impact Assessments (EIA)",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/eia-icon.png",
      link: "eia.html"
    },
    {
      title: "Environmental Audits",
      description: "Comprehensive audits to ensure your business meets environmental standards.",
      image: "assets/icons/audit-icon.png",
      link: "audits.html"
    },
    {
      title: "Sustainability Reporting",
      description: "Create ESG reports and sustainability frameworks for your organization.",
      image: "assets/icons/sustainability-icon.png",
      link: "sustainability.html"
    },
    {
      title: "ISO Certification Support",
      description: "Support for ISO 14001, ISO 45001, and related certifications.",
      image: "assets/icons/iso-icon.png",
      link: "iso-certification.html"
    }
  ];

  // Clear existing grid (if any)
  servicesGrid.innerHTML = '';

  consultancyServices.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <a href="${service.link}"> <!-- No resolvePath needed since we're in services folder -->
        <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </a>
    `;
    servicesGrid.appendChild(card);
  });
}

function initializeServiceDetail() {
  // Add any service detail page specific JavaScript here
  console.log('Service detail page initialized');
  
  // Example: Back button functionality
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = resolvePath('services.html');
    });
  }
}