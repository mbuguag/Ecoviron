class HeaderManager {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.menuToggle = document.querySelector('.header-menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavClose = document.querySelector('.mobile-nav-close');
    this.menuOverlay = document.querySelector('.menu-overlay');
    this.dropdowns = document.querySelectorAll('.dropdown');
    this.cartCountElements = document.querySelectorAll('[id^="mini-cart-count"]');
    
    // State management
    this.isMenuOpen = false;
    this.cartCount = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupScrollHeader();
    this.initCart();
    this.setupAccessibility();
    this.handleResize();
  }

  setupEventListeners() {
    // Mobile menu toggle
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    if (this.mobileNavClose) {
      this.mobileNavClose.addEventListener('click', () => this.closeMobileMenu());
    }

    if (this.menuOverlay) {
      this.menuOverlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // Mobile dropdown handling
    this.setupMobileDropdowns();

    // Desktop dropdown handling
    this.setupDesktopDropdowns();

    // Window events
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  setupScrollHeader() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  handleScroll() {
    if (!this.header) return;
    
    const scrollY = window.scrollY;
    const scrollThreshold = 50;
    
    if (scrollY > scrollThreshold) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.menuToggle?.classList.add('active');
    this.mobileNav?.classList.add('active');
    this.menuOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.mobileNavClose?.focus();
    
    // Update aria-expanded
    this.menuToggle?.setAttribute('aria-expanded', 'true');
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.menuToggle?.classList.remove('active');
    this.mobileNav?.classList.remove('active');
    this.menuOverlay?.classList.remove('active');
    document.body.style.overflow = '';
    
    // Close mobile dropdowns
    document.querySelectorAll('.mobile-nav .dropdown.active')
      .forEach(dropdown => dropdown.classList.remove('active'));
    
    // Update aria-expanded
    this.menuToggle?.setAttribute('aria-expanded', 'false');
    
    // Return focus to toggle button
    this.menuToggle?.focus();
  }

 setupMobileDropdowns() {
  const mobileDropdowns = document.querySelectorAll('.mobile-nav .dropdown > a');
  
  mobileDropdowns.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = link.closest('.dropdown');
      const isActive = dropdown.classList.contains('active');
      const key = dropdown.dataset.dropdown;

      // Close other dropdowns
      document.querySelectorAll('.mobile-nav .dropdown.active')
        .forEach(d => { if (d !== dropdown) d.classList.remove('active'); });

      // Toggle current dropdown
      dropdown.classList.toggle('active', !isActive);

      // 🔄 Notify desktop nav
      document.dispatchEvent(new CustomEvent("dropdownToggled", {
        detail: { key, open: !isActive, source: "mobile" }
      }));
    });
  });

  // Listen for desktop changes
  document.addEventListener("dropdownToggled", (e) => {
    if (e.detail.source === "mobile") return; // ignore own events
    const target = document.querySelector(`.mobile-nav .dropdown[data-dropdown="${e.detail.key}"]`);
    if (target) {
      target.classList.toggle("active", e.detail.open);
    }
  });
}


 setupDesktopDropdowns() {
  this.dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    const content = dropdown.querySelector('.dropdown-content');
    const key = dropdown.dataset.dropdown;

    if (!link || !content || !key) return;

    let hoverTimeout;

    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      content.style.display = 'block';

      document.dispatchEvent(new CustomEvent("dropdownToggled", {
        detail: { key, open: true, source: "desktop" }
      }));
    });

    dropdown.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        content.style.display = '';

        document.dispatchEvent(new CustomEvent("dropdownToggled", {
          detail: { key, open: false, source: "desktop" }
        }));
      }, 150);
    });

    // Keyboard navigation
    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        content.style.display = 'block';
        const firstLink = content.querySelector('a');
        firstLink?.focus();

        document.dispatchEvent(new CustomEvent("dropdownToggled", {
          detail: { key, open: true, source: "desktop" }
        }));
      }
    });
  });

  // Listen for mobile changes
  document.addEventListener("dropdownToggled", (e) => {
    if (e.detail.source === "desktop") return;
    const target = document.querySelector(`.site-header .dropdown[data-dropdown="${e.detail.key}"] .dropdown-content`);
    if (target) {
      target.style.display = e.detail.open ? "block" : "";
    }
  });
}


  initCart() {
    this.loadCartCount();
    
    // Listen for cart updates from other parts of the app
    document.addEventListener('cartUpdated', (e) => {
      this.updateCartCount(e.detail.count);
    });
  }

  loadCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('bionix_cart') || '[]');
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      this.updateCartCount(count);
    } catch (error) {
      console.warn('Error loading cart count:', error);
      this.updateCartCount(0);
    }
  }

  updateCartCount(count) {
    this.cartCount = count;
    
    this.cartCountElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  setupAccessibility() {
    // Add ARIA labels and roles where needed
    this.menuToggle?.setAttribute('aria-label', 'Toggle navigation menu');
    this.mobileNav?.setAttribute('role', 'navigation');
    this.mobileNav?.setAttribute('aria-label', 'Mobile navigation');
    
    // Add focus trap for mobile menu
    this.setupFocusTrap();
  }

  setupFocusTrap() {
    const focusableElements = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', (e) => {
      if (!this.isMenuOpen || e.key !== 'Tab') return;
      
      const focusableContent = this.mobileNav?.querySelectorAll(focusableElements);
      if (!focusableContent || focusableContent.length === 0) return;
      
      const firstFocusable = focusableContent[0];
      const lastFocusable = focusableContent[focusableContent.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }

  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `header-notification header-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  addToCart(product, quantity = 1) {
    try {
      const cart = JSON.parse(localStorage.getItem('bionix_cart') || '[]');
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }
      
      localStorage.setItem('bionix_cart', JSON.stringify(cart));
      this.loadCartCount();
      
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: this.cartCount, cart }
      }));
      
      this.showNotification(`${product.name || 'Item'} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding item to cart', 'error');
    }
  }

  getCartCount() {
    return this.cartCount;
  }
}

// Toggle dropdown
document.addEventListener("click", (e) => {
  const menu = e.target.closest(".user-menu");
  document.querySelectorAll(".user-dropdown").forEach(drop => {
    if (menu && menu.contains(drop)) {
      drop.style.display = drop.style.display === "flex" ? "none" : "flex";
    } else {
      drop.style.display = "none";
    }
  });
});

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bionixHeader = new HeaderManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderManager;
}
