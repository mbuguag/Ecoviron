// Load reusable components
function loadComponent(url, containerId) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      return res.text();
    })
    .then(data => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = data;
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// Resolve path based on current directory depth
function resolvePath(relativePath) {
  // Skip processing for absolute paths and full URLs
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }

  // For local development (127.0.0.1:5500)
  if (window.location.hostname === '127.0.0.1') {
    return '/Frontend/' + relativePath;
  }

  // For production (adjust if different)
  return '/' + relativePath;
}

// DOM ready handler
window.addEventListener('DOMContentLoaded', () => {
  loadComponent(resolvePath('components/header.html'), 'header-container');
  loadComponent(resolvePath('components/footer.html'), 'footer-container');

  if (document.getElementById('carousel-slide')) {
    initializeCarousel();
  }

  if (document.querySelector('.services-grid')) {
    initializeServicesGrid();
  }

  if (document.getElementById('contact-form')) {
    initializeContactForm();
  }

  if (document.getElementById('featured-products-grid')) {
    initializeFeaturedProducts();
  }

  if (document.getElementById('product-grid')) {
    initializeProductGrid();
  }
});

// Carousel logic
function initializeCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Reedbed Wastewater System", image: "assets/images/reedbed-wastewater.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    { title: "Safety Officer Inspection", image: "assets/images/officer-inspection.png" },
    { title: "Small Water Accessories", image: "assets/images/water-accessories.png" },
    { title: "Workplace Safety Inspection", image: "assets/images/workplace-safety.png" }
  ];

  services.forEach(service => {
    const slide = document.createElement("div");
    slide.className = "carousel-item";
    slide.innerHTML = `
      <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
      <h3>${service.title}</h3>
    `;
    carouselSlide.appendChild(slide);
  });

  let index = 0;
  const totalSlides = services.length;

  function showSlide(i) {
    carouselSlide.style.transform = `translateX(-${i * 100}%)`;
  }

  showSlide(index);

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % totalSlides;
      showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + totalSlides) % totalSlides;
      showSlide(index);
    });

    const intervalId = setInterval(() => {
      index = (index + 1) % totalSlides;
      showSlide(index);
    }, 5000);

    carouselSlide.dataset.intervalId = intervalId;
  }
}

// Services Grid logic
function initializeServicesGrid() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const consultancyServices = [
    {
      title: "Work safety and Hygiene Surveys",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/eia-icon.png",
      link: "services/eia.html"
    },
    {
      title: "Nema and OSHA Audits",
      description: "Comprehensive audits to ensure your business meets environmental standards.",
      image: "assets/icons/audit-icon.png",
      link: "services/audits.html"
    },
    {
      title: "Macrophyte ",
      description: "Create ESG reports and sustainability frameworks for your organization.",
      image: "assets/icons/sustainability-icon.png",
      link: "services/sustainability.html"
    },
    {
      title: "Environmental Audits",
      description: "Support for ISO 14001, ISO 45001, and related certifications.",
      image: "assets/icons/iso-icon.png",
      link: "services/iso-certification.html"
    }
  ];

  consultancyServices.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <a href="${resolvePath(service.link)}">
        <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </a>
    `;
    servicesGrid.appendChild(card);
  });
}

function initializeProductGrid() {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  const products = [
    {
      name: "Reusable Water Bottle",
      price: "KSh 850",
      image: "assets/images/products/water-bottle.jpg",
      link: "ecommerce/product-details.html?id=1",
      category: "sustainability"
    },
    {
      name: "Solar Lantern",
      price: "KSh 2,500",
      image: "assets/images/products/solar-lantern.jpg",
      link: "ecommerce/product-details.html?id=2",
      category: "energy"
    },
    {
      name: "Eco Tote Bag",
      price: "KSh 500",
      image: "assets/images/products/tote-bag.jpg",
      link: "ecommerce/product-details.html?id=3",
      category: "sustainability"
    },
    {
      name: "Biodegradable Soap",
      price: "KSh 300",
      image: "assets/images/products/soap.jpg",
      link: "ecommerce/product-details.html?id=4",
      category: "personal-care"
    }
  ];

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = `product-card ${product.category}`;
    card.innerHTML = `
      <a href="${resolvePath(product.link)}">
        <img src="${resolvePath(product.image)}" alt="${product.name}" loading="lazy">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="price">${product.price}</p>
        </div>
      </a>
    `;
    productGrid.appendChild(card);
  });
}

// Contact form handler
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Message sent successfully! (Form handling can be implemented via backend)");
    form.reset();
  });
}

function initializeFeaturedProducts() {
  const productGrid = document.getElementById("featured-products-grid");
  if (!productGrid) return;

  const products = [
    {
      name: "Reusable Water Bottle",
      price: "KSh 850",
      image: "assets/images/products/water-bottle.jpg",
      link: "ecommerce/product-details.html?id=1"
    },
    {
      name: "Solar Lantern",
      price: "KSh 2,500",
      image: "assets/images/products/solar-lantern.jpg",
      link: "ecommerce/product-details.html?id=2"
    },
    {
      name: "Eco Tote Bag",
      price: "KSh 500",
      image: "assets/images/products/tote-bag.jpg",
      link: "ecommerce/product-details.html?id=3"
    },
    {
      name: "Biodegradable Soap",
      price: "KSh 300",
      image: "assets/images/products/soap.jpg",
      link: "ecommerce/product-details.html?id=4"
    }
  ];

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <a href="${resolvePath(product.link)}">
        <img src="${resolvePath(product.image)}" alt="${product.name}" loading="lazy">
        <h4>${product.name}</h4>
        <p class="price">${product.price}</p>
      </a>
    `;
    productGrid.appendChild(card);
  });
}

function initializeProductGrid() {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  const products = [
    {
      name: "Reusable Water Bottle",
      price: "KSh 850",
      image: "assets/images/products/water-bottle.jpg",
      link: "ecommerce/product-details.html?id=1",
      category: "sustainability"
    },
    {
      name: "Solar Lantern",
      price: "KSh 2,500",
      image: "assets/images/products/solar-lantern.jpg",
      link: "ecommerce/product-details.html?id=2",
      category: "energy"
    },
    {
      name: "Eco Tote Bag",
      price: "KSh 500",
      image: "assets/images/products/tote-bag.jpg",
      link: "ecommerce/product-details.html?id=3",
      category: "sustainability"
    },
    {
      name: "Biodegradable Soap",
      price: "KSh 300",
      image: "assets/images/products/soap.jpg",
      link: "ecommerce/product-details.html?id=4",
      category: "personal-care"
    },
    {
      name: "Safety Helmet",
      price: "KSh 1,200",
      image: "assets/images/products/helmet.jpg",
      link: "ecommerce/product-details.html?id=5",
      category: "ppe"
    },
    {
      name: "First Aid Kit",
      price: "KSh 3,000",
      image: "assets/images/products/first-aid-kit.jpg",
      link: "ecommerce/product-details.html?id=6",
      category: "safety"
    },
    {
      name: "Reusable Face Mask",
      price: "KSh 250",
      image: "assets/images/products/face-mask.jpg",
      link: "ecommerce/product-details.html?id=7",
      category: "ppe"
    },
    {
      name: "Water Purifier",
      price: "KSh 4,500",
      image: "assets/images/products/water-purifier.jpg",
      link: "ecommerce/product-details.html?id=8",
      category: "water"
    }
  ];

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = `product-card ${product.category}`;
    card.innerHTML = `
      <a href="${resolvePath(product.link)}">
        <img src="${resolvePath(product.image)}" alt="${product.name}" loading="lazy">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="price">${product.price}</p>
        </div>
      </a>
    `;
    productGrid.appendChild(card);
  });

  // Add category filter functionality if needed
  const filterButtons = document.querySelectorAll('.product-filter button');
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        const productCards = productGrid.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
          if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}