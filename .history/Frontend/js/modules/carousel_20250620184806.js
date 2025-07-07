export function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const dotContainer = document.getElementById("carousel-dots");

  if (!carouselSlide) return;

  const services = [
    {
      title: "PPE and First Aid",
      image: "assets/images/ppe-first-aid.png",
      description:
        "Supplying certified PPE kits and essential first aid tools.",
      link: "service-details.html?id=ppe",
    },
    {
      title: "Safety Gear Display",
      image: "assets/images/safety-gear.png",
      description: "Showcasing high-visibility and protective equipment.",
      link: "service-details.html?id=safety",
    },
    {
      title: "Office Inspections",
      image: "assets/images/officer-inspection.png",
      description:
        "Routine inspections to meet safety and compliance standards.",
      link: "service-details.html?id=inspections",
    },
    {
      title: "Waste Water Management",
      image: "assets/images/reelbed-wastewater.png",
      description:
        "Eco-friendly waste water treatment and management solutions.",
      link: "service-details.html?id=wastewater",
    },
    {
      title: "Environmental Audits",
      image: "assets/images/hero-bg.png",
      description: "Comprehensive audits to ensure environmental compliance.",
      link: "service-details.html?id=audits",
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
          <h3 class="fade-up">${service.title}</h3>
          <p class="fade-up">${service.description}</p>
          <a href="${service.link}" class="read-more-btn">Read More</a>
        </div>
      </div>
    `
      )
      .join("");

    dotContainer.innerHTML = services
      .map(
        (_, i) =>
          `<span class="carousel-dot ${
            i === 0 ? "active" : ""
          }" data-index="${i}"></span>`
      )
      .join("");

    bindDotEvents();
  }

  function showSlide(index) {
    const items = document.querySelectorAll(".carousel-item");
    const dots = document.querySelectorAll(".carousel-dot");
    if (items.length === 0) return;

    items.forEach((item) => item.classList.remove("active", "visible"));
    dots.forEach((dot) => dot.classList.remove("active"));

    currentIndex = (index + items.length) % items.length;
    const current = items[currentIndex];
    const dot = dots[currentIndex];

    current.classList.add("active");
    dot.classList.add("active");

    setTimeout(() => {
      current.classList.add("visible");
    }, 20);
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function bindDotEvents() {
    const dots = document.querySelectorAll(".carousel-dot");
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.dataset.index);
        showSlide(index);
      });
    });
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
