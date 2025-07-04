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
    title: "PPE and First Aid",
    image: "assets/images/ppe-first-aid.png",
  },
  {
    title: "Reedbed Wastewater System",
    image: "assets/images/reedbed-wastewater.png",
  },
  {
    title: "Safety Gear Display",
    image: "assets/images/safety-gear.png",
  },
  {
    title: "Safety Officer Inspection",
    image: "assets/images/officer-inspection.png",
  },
  {
    title: "Small Water Accessories",
    image: "assets/images/water-accessories.png",
  },
  {
    title: "Workplace Safety Inspection",
        image: "assets/images/workplace-safety.png",
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
