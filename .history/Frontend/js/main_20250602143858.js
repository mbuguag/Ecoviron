// Load reusable header and footer
window.addEventListener('DOMContentLoaded', () => {
  loadComponent('components/header.html', 'header-container');
  loadComponent('components/footer.html', 'footer-container');
});

function loadComponent(url, containerId) {
  fetch(url)
    .then(res => res.text())
    .then(data => {
      document.getElementById(containerId).innerHTML = data;
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

const services = [
  {
    title: "Environmental Impact Assessments",
    image: "assets/images/eia.jpg",
  },
  {
    title: "Sustainability Consulting",
    image: "assets/images/sustainability.jpg",
  },
  {
    title: "Waste Management Solutions",
    image: "assets/images/waste.jpg",
  },
  {
    title: "Carbon Credit Advisory",
    image: "assets/images/carbon.jpg",
  }
];

function renderCarousel() {
  const container = document.getElementById("carouselContainer");
  services.forEach(service => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img src="${service.image}" alt="${service.title}">
      <h3>${service.title}</h3>
    `;
    container.appendChild(item);
  });
}

let currentIndex = 0;

function updateCarouselPosition() {
  const container = document.getElementById("carouselContainer");
  container.style.transform = `translateX(-${currentIndex * 100}%)`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCarousel();

  document.getElementById("prevBtn").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + services.length) % services.length;
    updateCarouselPosition();
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % services.length;
    updateCarouselPosition();
  });
});
