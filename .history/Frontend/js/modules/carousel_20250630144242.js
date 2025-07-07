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
    {
      title: "Waste Water Management",
      image: "assets/images/reelbed-wastewater.png",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/reelbed-wastewater.png",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/reelbed-wastewater.png",
    },
    {
      title: "Environmental Assessment",
      image: "assets/images/hero-bg.png",
    },
  ];

  const itemsPerView = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  let currentIndex = 0;
  let autoScrollInterval;

  // Generate carousel items
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

    renderDots();
    updateActiveDot();
    triggerAnimations();
  }

  // Update slide position
  function showSlide(index) {
    const totalItems = services.length;
    const itemsVisible = itemsPerView();
    const maxIndex = totalItems - itemsVisible;

    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const slideWidth = 100 / itemsVisible;
    const translateX = -(slideWidth * currentIndex);

    carouselSlide.style.transform = `translateX(${translateX}%)`;

    updateActiveDot();
    triggerAnimations();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % services.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + services.length) % services.length;
    showSlide(currentIndex);
  }

  // Dots
  function renderDots() {
    const dotContainerId = "carousel-dots";
    let dotContainer = document.getElementById(dotContainerId);
    if (!dotContainer) {
      dotContainer = document.createElement("div");
      dotContainer.id = dotContainerId;
      dotContainer.className = "carousel-dots";
      carouselSlide.parentElement.appendChild(dotContainer);
    }

    dotContainer.innerHTML = "";
    const totalDots = Math.ceil(services.length / itemsPerView());
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("span");
      dot.classList.add("carousel-dot");
      dot.addEventListener("click", () => showSlide(i));
      dotContainer.appendChild(dot);
    }
  }

  function updateActiveDot() {
    const dots = document.querySelectorAll(".carousel-dot");
    dots.forEach((dot) => dot.classList.remove("active"));
    const index = Math.floor(currentIndex / itemsPerView());
    if (dots[index]) dots[index].classList.add("active");
  }

  // Auto-scroll
  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Animations
  function triggerAnimations() {
    document.querySelectorAll(".carousel-item").forEach((item, i) => {
      item.classList.remove("visible");
      setTimeout(() => item.classList.add("visible"), i * 100);
    });
  }

  // Events
  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);
  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);
  window.addEventListener("resize", () => {
    renderSlides();
    showSlide(currentIndex);
  });

  // Initialize
  renderSlides();
  showSlide(currentIndex);
  startAutoScroll();
}
