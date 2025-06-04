// Load reusable header and footer
function loadComponent(url, containerId) {
  fetch(url)
    .then(res => res.text())
    .then(data => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = data;
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

window.addEventListener('DOMContentLoaded', () => {
  // Load header and footer (adjust path if needed per page depth)
  loadComponent('components/header.html', 'header-container');
  loadComponent('components/footer.html', 'footer-container');

  // Initialize Carousel
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Reedbed Wastewater System", image: "assets/images/reedbed-wastewater.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    { title: "Safety Officer Inspection", image: "assets/images/officer-inspection.png" },
    { title: "Small Water Accessories", image: "assets/images/water-accessories.png" },
    { title: "Workplace Safety Inspection", image: "assets/images/workplace-safety.png" }
  ];

  if (carouselSlide) {
    services.forEach(service => {
      const slide = document.createElement("div");
      slide.className = "carousel-item";
      slide.innerHTML = `
        <img src="${service.image}" alt="${service.title}">
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

      setInterval(() => {
        index = (index + 1) % totalSlides;
        showSlide(index);
      }, 5000);
    }
  }

  // Render consultancy services if available
  const servicesGrid = document.querySelector('.services-grid');
  if (servicesGrid) {
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
        <a href="${service.link}">
          <img src="${service.image}" alt="${service.title}">
          <h3>${service.title}</h3>
          <p>${service.description}</p>
        </a>
      `;
      servicesGrid.appendChild(card);
    });
  }
});
