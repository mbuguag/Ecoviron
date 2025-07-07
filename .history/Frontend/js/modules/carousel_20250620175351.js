export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    {
      title: "Office Inspections",
      image: "assets/images/officer-inspection.png",
    },
    // Add more as needed
  ];

  let index = 0;
  let autoScrollInterval;

  function renderSlides() {
    carouselSlide.innerHTML = services
      .map(
        (service) => `
      <div class="carousel-item">
        <img src="${service.image}" alt="${service.title}">
        <h3>${service.title}</h3>
      </div>
    `
      )
      .join("");

    updateSlidePosition();
    triggerAnimations();
  }

  function updateSlidePosition() {
    const slideWidth = carouselSlide.offsetWidth;
    carouselSlide.style.transition = "transform 0.5s ease-in-out";
    carouselSlide.style.transform = `translateX(-${index * slideWidth}px)`;
  }

  function nextSlide() {
    index = (index + 1) % services.length;
    updateSlidePosition();
    triggerAnimations();
  }

  function prevSlide() {
    index = (index - 1 + services.length) % services.length;
    updateSlidePosition();
    triggerAnimations();
  }

  // Auto-scroll
  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 4000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Animate visible items
  function triggerAnimations() {
    const items = document.querySelectorAll(".carousel-item");
    items.forEach((item, i) => {
      item.classList.remove("visible");
      setTimeout(() => item.classList.add("visible"), i * 100);
    });
  }

  // Intersection Observer to animate on scroll into view (optional)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerAnimations();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(carouselSlide);

  // Event listeners
  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);
  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);

  renderSlides();
  startAutoScroll();
}
