export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    {
      title: "PPE and First Aid",
      image: "assets/images/ppe-first-aid.png",
      description:
        "Supplying certified PPE kits and essential first aid tools.",
      link: "/services/ppe-first-aid",
    },
    {
      title: "Safety Gear Display",
      image: "assets/images/safety-gear.png",
      description: "Showcasing high-visibility and protective equipment.",
      link: "/services/safety-gear",
    },
    {
      title: "Office Inspections",
      image: "assets/images/officer-inspection.png",
      description:
        "Routine inspections to meet safety and compliance standards.",
      link: "/services/office-inspections",
    },
    {
      title: "Waste Water Management",
      image: "assets/images/reelbed-wastewater.png",
      description:
        "Eco-friendly waste water treatment and management solutions.",
      link: "/services/waste-water",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/hero-bg.png",
      description: "Comprehensive audits to ensure environmental compliance.",
      link: "/services/environmental-audits",
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
        <div class="carousel-text">
          <h3 class="animated-text">${service.title}</h3>
          <p class="carousel-description animated-text">${
            service.description
          }</p>
          <a href="${service.link}" class="read-more-btn">Read More</a>
        </div>
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
    setTimeout(() => current.classList.add("visible"), 20);

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

  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);
  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);

  renderSlides();
  showSlide(0);
  startAutoScroll();
}
