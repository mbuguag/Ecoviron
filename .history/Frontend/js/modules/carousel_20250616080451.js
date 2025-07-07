export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    // ... other services
  ];

  // Carousel implementation
  let index = 0;
  
  function showSlide() {
    carouselSlide.innerHTML = services.map(service => `
      <div class="carousel-item">
        <img src="${service.image}" alt="${service.title}">
        <h3>${service.title}</h3>
      </div>
    `).join('');
    
    carouselSlide.style.transform = `translateX(-${index * 100}%)`;
  }

  nextBtn?.addEventListener("click", () => {
    index = (index + 1) % services.length;
    showSlide();
  });

  prevBtn?.addEventListener("click", () => {
    index = (index - 1 + services.length) % services.length;
    showSlide();
  });

  showSlide();
}