export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    {title:"Office Inspections", image: "assets/images/officer-inspection.png"}
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
 
 
    requestAnimationFrame(() => {
      document.querySelectorAll('.carousel-item').forEach(item => {
        item.classList.remove('visible'); // reset
      });

      if (isInViewport(carouselSlide)) {
        triggerAnimations();
      }
    });
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerAnimations();
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, { threshold: 0.25 });

  observer.observe(carouselSlide);

  function triggerAnimations() {
    document.querySelectorAll('.carousel-item').forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), i * 100); // staggered animation
    });
  }

  function isInViewport(elem) {
    const rect = elem.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }
}
}