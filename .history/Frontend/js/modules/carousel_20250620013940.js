export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    {
      title: "Fire Extinguishers",
      image: "assets/images/fire-extinguisher.png",
    },
    { title: "Gas Detectors", image: "assets/images/gas-detector.png" },
    {
      title: "Training Materials",
      image: "assets/images/training-material.png",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/environmental-audit.png",
    },
  ];

  let index = 0;
  let autoSlideInterval;

  function renderSlide() {
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
    triggerAnimations();
  }

  function nextSlide() {
    index = (index + 1) % services.length;
    renderSlide();
  }

  function prevSlide() {
    index = (index - 1 + services.length) % services.length;
    renderSlide();
  }

  nextBtn?.addEventListener("click", () => {
    stopAutoplay();
    nextSlide();
  });

  prevBtn?.addEventListener("click", () => {
    stopAutoplay();
    prevSlide();
  });

  // ===== Autoplay =====
  function startAutoplay() {
    autoSlideInterval = setInterval(nextSlide, 5000); // Change every 5s
  }

  function stopAutoplay() {
    clearInterval(autoSlideInterval);
  }

  // ===== Swipe Support =====
  let startX = 0;
  let isSwiping = false;

  carouselSlide.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  carouselSlide.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    const touchX = e.touches[0].clientX;
    const diff = startX - touchX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      if (diff > 0) nextSlide(); // Swipe left
      else prevSlide(); // Swipe right
      isSwiping = false;
    }
  });

  carouselSlide.addEventListener("touchend", () => {
    isSwiping = false;
  });

  // ===== Scroll Animation on Load =====
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

  function triggerAnimations() {
    document.querySelectorAll(".carousel-item").forEach((item, i) => {
      item.classList.remove("visible"); // reset first
      setTimeout(() => item.classList.add("visible"), i * 100); // staggered reveal
    });
  }

  renderSlide();
  startAutoplay();
}
