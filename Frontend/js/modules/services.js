export function initServices() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const services = [
    {
      title: "Work safety and Hygiene Surveys",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/occupational-safety-and-health.png",
      link: "services/eia.html"
    },
    // ... other services
  ];

  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card">
      <a href="${service.link}">
        <img src="${service.image}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </a>
    </div>
  `).join('');
}