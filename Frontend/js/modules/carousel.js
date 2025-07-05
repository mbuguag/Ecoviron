
export async function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = await fetchServices();

  const itemsPerView = () => {
    const width = window.innerWidth;
    if (width <= 600) return 1;
    if (width <= 1024) return 2;
    return 3;
  };

  let currentIndex = 0;
  let autoScrollInterval;

  function applyItemWidths() {
    const items = document.querySelectorAll(".carousel-item");
    const width = 100 / itemsPerView();
    items.forEach((item) => {
      item.style.flex = `0 0 ${width}%`;
    });
  }

  function renderSlides() {
    carouselSlide.innerHTML = services
      .map(
        (service) => `
    <div class="carousel-item">
      <img src="${service.image}" alt="${service.title}" loading="lazy" />
      <h3>${service.title}</h3>
    </div>
  `
      )
      .join("");

    applyItemWidths();
    renderDots();
    updateActiveDot();
    triggerAnimations();

    
    const images = carouselSlide.querySelectorAll("img");
    images.forEach((img) => {
      if (img.complete) {
        img.classList.add("loaded"); // For cached images
      } else {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });
      }
    });
  }


  function showSlide(index) {
    const maxIndex = services.length - itemsPerView();
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const slideWidth = 100 / itemsPerView();
    const translateX = -(slideWidth * currentIndex);

    carouselSlide.style.transform = `translateX(${translateX}%)`;

    updateActiveDot();
    updateProgressBar();
    triggerAnimations();
  }

  function nextSlide() {
    const maxIndex = services.length - itemsPerView();
    currentIndex = currentIndex + 1 > maxIndex ? 0 : currentIndex + 1;
    showSlide(currentIndex);
  }

  function prevSlide() {
    const maxIndex = services.length - itemsPerView();
    currentIndex = currentIndex - 1 < 0 ? maxIndex : currentIndex - 1;
    showSlide(currentIndex);
  }

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
      dot.addEventListener("click", () => {
        showSlide(i);
        restartAutoScroll();
      });
      dotContainer.appendChild(dot);
    }
  }

  function updateActiveDot() {
    const dots = document.querySelectorAll(".carousel-dot");
    dots.forEach((dot) => dot.classList.remove("active"));
    const index = Math.floor(currentIndex / itemsPerView());
    if (dots[index]) dots[index].classList.add("active");
  }

  function updateProgressBar() {
    const progressBar = document.getElementById("carousel-progress-bar-fill");
    if (progressBar) {
      const total = Math.ceil(services.length / itemsPerView());
      const progress =
        ((Math.floor(currentIndex / itemsPerView()) + 1) / total) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  function restartAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  function triggerAnimations() {
    document.querySelectorAll(".carousel-item").forEach((item, i) => {
      item.classList.remove("visible");
      setTimeout(() => item.classList.add("visible"), i * 100);
    });
  }

  function addTouchSupport() {
    let startX = 0;
    carouselSlide.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    carouselSlide.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (diff > 50) {
        nextSlide();
        restartAutoScroll();
      } else if (diff < -50) {
        prevSlide();
        restartAutoScroll();
      }
    });
  }

  async function fetchServices() {
    // Replace with live API if needed
    try {
      // const res = await fetch("http://localhost:8080/api/services");
      // return await res.json();

      return [
        {
          title: "First  Aid Kit Refill",
          image: "assets/images/ppe-first-aid.png",
        },
        {
          title: "Personal Protective Equipments",
          image: "assets/images/safety-gear.png",
        },
        {
          title: "Workplace  Hygiene Surveys",
          image: "assets/images/NEMA.jpg",
        },
        {
          title: "Waste Water Management",
          image: "assets/images/reelbed-wastewater.png",
        },
        {
          title: "NEMA Audits",
          image: "assets/images/Environmental Audits.jpg",
        },
        {
          title: "OSHA Audits ",
          image: "assets/images/hero-bg.png",
        },
      ];
    } catch (err) {
      console.error("Failed to load services", err);
      return [];
    }
  }

  // Event Listeners
  nextBtn?.addEventListener("click", () => {
    nextSlide();
    restartAutoScroll();
  });

  prevBtn?.addEventListener("click", () => {
    prevSlide();
    restartAutoScroll();
  });

  carouselSlide.addEventListener("mouseenter", stopAutoScroll);
  carouselSlide.addEventListener("mouseleave", startAutoScroll);

  window.addEventListener("resize", () => {
    const maxIndex = services.length - itemsPerView();
    currentIndex = Math.min(currentIndex, maxIndex);
    renderSlides();
    showSlide(currentIndex);
  });

  // Init
  renderSlides();
  showSlide(currentIndex);
  startAutoScroll();
  addTouchSupport();
}
