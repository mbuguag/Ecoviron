// Configuration
const CONFIG = {
  basePath: window.location.hostname === '127.0.0.1' ? '/Frontend/' : '/',
  apiBaseUrl: 'http://localhost:8080/api'
};

// Path resolution utility
function resolvePath(relativePath) {
  if (relativePath.startsWith('/') || relativePath.match(/^https?:/)) {
    return relativePath;
  }
  return CONFIG.basePath + relativePath;
}

// Component loader
async function loadComponent(url, containerId) {
  try {
    const fullUrl = resolvePath(url);
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (container) {
      container.innerHTML = html;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to load component ${url}:`, error);
    return false;
  }
}

// Product Service
const ProductService = {
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/products/featured`);
      if (!response.ok) throw new Error("Failed to fetch featured products");
      return await response.json();
    } catch (error) {
      console.error("ProductService.getFeaturedProducts error:", error);
      return [];
    }
  },

  async getAllProducts() {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json();
    } catch (error) {
      console.error("ProductService.getAllProducts error:", error);
      return [];
    }
  }
};

// Cart Service
const CartService = {
  getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  },

  addToCart(product) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  }
};

// UI Components
const UIComponents = {
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    
    card.innerHTML = `
      <img src="${resolvePath(product.image)}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p class="price">${product.price}</p>
        <button class="add-to-cart-btn"
          data-id="${product.id}"
          data-name="${product.name}"
          data-price="${product.price}"
          data-image="${product.image}">
          Add to Cart
        </button>
      </div>
    `;
    
    return card;
  },

  renderProductGrid(products, containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
      ? products 
      : products.filter(p => p.category === filter);
    
    filteredProducts.forEach(product => {
      container.appendChild(this.createProductCard(product));
    });
    
    this.attachCartListeners();
  },

  attachCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          image: btn.dataset.image
        };
        
        CartService.addToCart(product);
        alert(`${product.name} added to cart!`);
      });
    });
  }
};

// Initialize Carousel
function initializeCarousel() {
  const carouselSlide = document.getElementById("carousel-slide");
  if (!carouselSlide) return;

  const services = [
    { title: "PPE and First Aid", image: "assets/images/ppe-first-aid.png" },
    { title: "Safety Gear Display", image: "assets/images/safety-gear.png" },
    { title: "Safety Officer Inspection", image: "assets/images/officer-inspection.png" },
    { title: "Small Water Accessories", image: "assets/images/water-accessories.png" },
    { title: "Workplace Safety Inspection", image: "assets/images/workplace-safety.png" }
  ];

  carouselSlide.innerHTML = services.map(service => `
    <div class="carousel-item">
      <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
      <h3>${service.title}</h3>
    </div>
  `).join('');

  let index = 0;
  const totalSlides = services.length;

  function showSlide(i) {
    carouselSlide.style.transform = `translateX(-${i * 100}%)`;
  }

  showSlide(index);

  document.getElementById("nextBtn")?.addEventListener('click', () => {
    index = (index + 1) % totalSlides;
    showSlide(index);
  });

  document.getElementById("prevBtn")?.addEventListener('click', () => {
    index = (index - 1 + totalSlides) % totalSlides;
    showSlide(index);
  });

  const intervalId = setInterval(() => {
    index = (index + 1) % totalSlides;
    showSlide(index);
  }, 5000);

  carouselSlide.dataset.intervalId = intervalId;
}

// Initialize Services Grid
function initializeServicesGrid() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  const services = [
    {
      title: "Work safety and Hygiene Surveys",
      description: "Prepare compliant EIAs for projects to meet NEMA regulations.",
      image: "assets/icons/occupational-safety-and-health.png",
      link: "services/eia.html"
    },
    // ... other services
  ];

  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card">
      <a href="${resolvePath(service.link)}">
        <img src="${resolvePath(service.image)}" alt="${service.title}" loading="lazy">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </a>
    </div>
  `).join('');
}

// Initialize Contact Form
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(form);
      const response = await fetch(`${CONFIG.apiBaseUrl}/contact`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to submit form');
      
      alert("Message sent successfully!");
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Failed to send message. Please try again.");
    }
  });
}

// Main Initialization
window.addEventListener('DOMContentLoaded', async () => {
  // Load components
  await Promise.all([
    loadComponent('components/header.html', 'header-container'),
    loadComponent('components/footer.html', 'footer-container')
  ]);

  // Initialize page sections
  if (document.getElementById('carousel-slide')) initializeCarousel();
  if (document.querySelector('.services-grid')) initializeServicesGrid();
  if (document.getElementById('contact-form')) initializeContactForm();

  // Load products
  if (document.getElementById('featured-products-grid')) {
    const products = await ProductService.getFeaturedProducts();
    UIComponents.renderProductGrid(products, 'featured-products-grid');
  }

  if (document.getElementById('product-grid')) {
    const products = await ProductService.getAllProducts();
    UIComponents.renderProductGrid(products, 'product-grid');
    
    // Add filter functionality
    document.querySelectorAll('.product-filter button').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        UIComponents.renderProductGrid(products, 'product-grid', filter);
      });
    });
  }
});