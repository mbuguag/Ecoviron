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
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// Resolve path (keeps paths relative for same-folder structure)
function resolvePath(relativePath) {
  // If absolute or external, return as-is
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  // Count how deep we are from root
  const pathDepth = window.location.pathname
    .replace(/\/$/, '')            // Remove trailing slash
    .split('/')                    // Split by slash
    .filter(p => p && !p.includes('.html')).length;

  const prefix = '../'.repeat(pathDepth);
  return prefix + relativePath;
}


// Main DOM ready handler
window.addEventListener('DOMContentLoaded', () => {
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  if (document.getElementById('carousel-slide')) {
    initializeCarousel();
  }

  if (document.querySelector('.services-grid')) {
    initializeServicesGrid();
  }

  if (document.getElementById('contact-form')) {
    initializeContactForm();
  }
});

// Carousel logic
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

  showSlide(index);

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

    carouselSlide.dataset.intervalId = intervalId;
  }
}

// Services Grid logic
function initializeServicesGrid() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const consultancyServices = [
    {
      title: "Environmental Impact Assessments (EIA)",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/eia-icon.png",
      link: "services/eia.html"
    },
    {
      title: "Environmental Audits",
      description: "Comprehensive audits to ensure your business meets environmental standards.",
      image: "assets/icons/audit-icon.png",
      link: "services/audits.html"
    },
    {
      title: "Sustainability Reporting",
      description: "Create ESG reports and sustainability frameworks for your organization.",
      image: "assets/icons/sustainability-icon.png",
      link: "services/sustainability.html"
    },
    {
      title: "ISO Certification Support",
      description: "Support for ISO 14001, ISO 45001, and related certifications.",
      image: "assets/icons/iso-icon.png",
      link: "services/iso-certification.html"
    }
  ];

  consultancyServices.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <a href="${resolvePath(service.link)}">
        <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </a>
    `;
    servicesGrid.appendChild(card);
  });
}

// Contact form handler
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Message sent successfully! (Form handling can be implemented via backend)");
    form.reset();
  });
}
