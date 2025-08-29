export async function initCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) {
    console.error("Carousel container #carousel-slide not found");
    return;
  }

  async function fetchServices() {
    // Replace with live API if needed
    try {
      return [
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
          image: "assets/images/OSHA.jpg",
        },
      ];
    } catch (err) {
      console.error("Failed to load services", err);
      return [];
    }
  }

  const services = await fetchServices();
  console.log("Services loaded:", services);

  // ✅ Early return if no services
  if (!services || services.length === 0) {
    console.error("No services available for carousel");
    carouselSlide.innerHTML = '<div class="carousel-error">No services available</div>';
    return;
  }

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
    // ✅ Generate HTML template
    const html = services
      .map(
        (service) => `
    <div class="carousel-item">
      <img src="${service.image}" alt="${service.title}" loading="lazy" />
      <h3>${service.title}</h3>
    </div>
  `
      )
      .join("");

    // ✅ Inject HTML into carousel
    carouselSlide.innerHTML = html;
    
    // ✅ Log after rendering
    console.log("Carousel HTML rendered, length:", carouselSlide.innerHTML.length);

    applyItemWidths();
    renderDots();
    updateActiveDot();
    triggerAnimations();

    // Handle image loading
    const images = carouselSlide.querySelectorAll("img");
    images.forEach((img) => {
      if (img.complete) {
        img.classList.add("loaded"); // For cached images
      } else {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });
        img.addEventListener("error", () => {
          console.warn(`Failed to load carousel image: ${img.src}`);
          img.alt = "Image unavailable";
        });
      }
    });
  }

  function showSlide(index) {
    const maxIndex = Math.max(0, services.length - itemsPerView());
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const slideWidth = 100 / itemsPerView();
    const translateX = -(slideWidth * currentIndex);

    carouselSlide.style.transform = `translateX(${translateX}%)`;

    updateActiveDot();
    updateProgressBar();
    triggerAnimations();
  }

  function nextSlide() {
    const maxIndex = Math.max(0, services.length - itemsPerView());
    currentIndex = currentIndex + 1 > maxIndex ? 0 : currentIndex + 1;
    showSlide(currentIndex);
  }

  function prevSlide() {
    const maxIndex = Math.max(0, services.length - itemsPerView());
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
    const dotIndex = Math.floor(currentIndex);
    if (dots[dotIndex]) dots[dotIndex].classList.add("active");
  }

  function updateProgressBar() {
    const progressBar = document.getElementById("carousel-progress-bar-fill");
    if (progressBar) {
      const total = Math.ceil(services.length / itemsPerView());
      const progress = ((currentIndex + 1) / total) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
  }

  function startAutoScroll() {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function restartAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  function triggerAnimations() {
    const items = document.querySelectorAll(".carousel-item");
    items.forEach((item, i) => {
      item.classList.remove("visible");
      // ✅ Stagger animations
      setTimeout(() => {
        if (item.parentElement) { // Check if still in DOM
          item.classList.add("visible");
        }
      }, i * 100);
    });
  }

  function addTouchSupport() {
    let startX = 0;
    let isDragging = false;

    carouselSlide.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAutoScroll();
    }, { passive: true });

    carouselSlide.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      // Optional: Add visual feedback during drag
    }, { passive: true });

    carouselSlide.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      restartAutoScroll();
    }, { passive: true });
  }

  // ✅ Initialize carousel in correct order
  try {
    // 1. Render slides first
    renderSlides();
    
    // 2. Then set up controls and interactions
    nextBtn?.addEventListener("click", () => {
      nextSlide();
      restartAutoScroll();
    });

    prevBtn?.addEventListener("click", () => {
      prevSlide();
      restartAutoScroll();
    });

    // 3. Add hover pause/resume
    carouselSlide.addEventListener("mouseenter", stopAutoScroll);
    carouselSlide.addEventListener("mouseleave", startAutoScroll);

    // 4. Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const maxIndex = Math.max(0, services.length - itemsPerView());
        currentIndex = Math.min(currentIndex, maxIndex);
        renderSlides();
        showSlide(currentIndex);
      }, 250);
    });

    // 5. Initialize position and auto-scroll
    showSlide(0);
    addTouchSupport();
    startAutoScroll();

    console.log("✅ Carousel initialized successfully");

  } catch (err) {
    console.error("❌ Carousel initialization failed:", err);
    carouselSlide.innerHTML = '<div class="carousel-error">Failed to load carousel</div>';
  }
}