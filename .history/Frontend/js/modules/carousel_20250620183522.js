export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    {
      title: "PPE and First Aid",
      image: "assets/images/ppe-first-aid.png",
      description: "We supply certified PPE kits and first aid essentials.",
    },
    {
      title: "Safety Gear Display",
      image: "assets/images/safety-gear.png",
      description: "High-visibility gear for optimal workplace protection.",
    },
    {
      title: "Office Inspections",
      image: "assets/images/officer-inspection.png",
      description: "Routine and compliance inspections for offices.",
    },
    {
      title: "Emergency Drills",
      image: "assets/images/drill.png",
      description: "Plan and execute fire, chemical, and emergency drills.",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/audit.png",
      description: "Full-scale audits for environmental compliance.",
    },
  ];


  let currentIndex = 0;
  let autoScrollInterval;

  function renderSlides() {
    carouselSlide.innerHTML = services
      .map(
        (service, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${service.image}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
      </div>
    `
      )
      .join("");
    updateProgressBar();
  }

  function showSlide(index) {
    const items = document.querySelectorAll(".carousel-item");
    if (items.length === 0) return;

    items.forEach((item) => item.classList.remove("active", "visible"));

    currentIndex = (index + items.length) % items.length;
    const current = items[currentIndex];

    current.classList.add("active");
    setTimeout(() => current.classList.add("visible"), 20); // trigger fade-in

    updateProgressBar();
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function updateProgressBar() {
    const bar = document.getElementById("carousel-progress-bar-fill");
    if (bar) {
      const percent = ((currentIndex + 1) / services.length) * 100;
      bar.style.width = `${percent}%`;
    }
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Events
  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);
  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);

  renderSlides();
  showSlide(0);
  startAutoScroll();
}
