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

  function showSlide() {
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

    carouselSlide.style.transform = `translateX(-${index * 100}%)`;

    requestAnimationFrame(() => {
      document.querySelectorAll(".carousel-item").forEach((item) => {
        item.classList.remove("visible"); // reset
      });

      if (isInViewport(carouselSlide)) {
        triggerAnimations();
      }
    });
  }

  function nextSlide() {
    index = (index + 1) % services.length;
    showSlide();
  }

  function prevSlide() {
    index = (index - 1 + services.length) % services.length;
    showSlide();
  }

  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);

  // Auto-scroll
  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 4000); // 4s per slide
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Pause on hover
  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);

  showSlide();
  startAutoScroll();

  // Animate on scroll into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerAnimations();
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(carouselSlide);

  function triggerAnimations() {
    document.querySelectorAll(".carousel-item").forEach((item, i) => {
      setTimeout(() => item.classList.add("visible"), i * 100);
    });
  }

  function isInViewport(elem) {
    const rect = elem.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }
}
