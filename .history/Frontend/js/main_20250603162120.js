// Load reusable HTML components
function loadComponent(url, containerId) {
  fetch(url)
    .then(res => res.ok ? res.text() : Promise.reject(`Failed to load ${url}`))
    .then(html => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = html;
    })
    .catch(console.error);
}

// Resolve path based on depth for cross-page consistency
function resolvePath(path) {
  if (path.startsWith('/') || path.startsWith('http')) return path;

  const depth = window.location.pathname.split('/').filter(p => p && !p.endsWith('.html')).length;
  return '../'.repeat(depth) + path;
}

// Dynamically render service cards
function renderServiceCards(containerSelector) {
  const services = [
    {
      title: "Environmental Audits",
      description: "Comprehensive assessment of your environmental compliance and sustainability practices.",
      image: "assets/icons/audit-icon.png",
      link: "services/audits.html"
    },
    {
      title: "Environmental Impact Assessments (EIA)",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/eia-icon.png",
      link: "services/eia.html"
    },
    {
      title: "ISO Certification Support",
      description: "Support for ISO 14001, ISO 45001, and related certifications.",
      image: "assets/icons/iso-icon.png",
      link: "services/iso-certification.html"
    },
    {
      title: "Sustainability Consulting",
      description: "Develop and implement corporate sustainability strategies and reporting.",
      image: "assets/icons/sustainability-icon.png",
      link: "services/sustainability.html"
    }
  ];

  const grid = document.querySelector(containerSelector);
  if (!grid) return;

  services.forEach(({ title, description, image, link }) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <a href="${resolvePath(link)}">
        <div class="service-icon">
          <img src="${resolvePath(image)}" alt="${title}" loading="lazy">
        </div>
        <h3>${title}</h3>
        <p>${description}</p>
      </a>
    `;
    grid.appendChild(card);
  });
}

// Optional: Render a basic carousel if present
function initCarousel() {
  const slideContainer = document.getElementById("carousel-slide");
  if (!slideContainer) return;

  const slides = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Reedbed Wastewater System", image: "assets/images/reedbed-wastewater.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    { title: "Safety Officer Inspection", image: "assets/images/officer-inspection.png" },
    { title: "Small Water Accessories", image: "assets/images/water-accessories.png" },
    { title: "Workplace Safety Inspection", image: "assets/images/workplace-safety.png" }
  ];

  slides.forEach(({ title, image }) => {
    const div = document.createElement('div');
    div.className = "carousel-item";
    div.innerHTML = `<img src="${resolvePath(image)}" alt="${title}" loading="lazy"><h3>${title}</h3>`;
    slideContainer.appendChild(div);
  });

  let currentIndex = 0;
  const total = slides.length;

  function show(index) {
    slideContainer.style.transform = `translateX(-${index * 100}%)`;
  }

  show(currentIndex);

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % total;
    show(currentIndex);
  });

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + total) % total;
    show(currentIndex);
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % total;
    show(currentIndex);
  }, 5000);
}

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  renderServiceCards('.services-grid');
  initCarousel(); // Only runs if carousel is present
});
