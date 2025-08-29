//
class HeaderManager {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.menuToggle = document.querySelector('.header-menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavClose = document.querySelector('.mobile-nav-close');
    this.menuOverlay = document.querySelector('.menu-overlay');
    this.dropdowns = document.querySelectorAll('.dropdown');
    this.authContainers = document.querySelectorAll('[id^="auth-container"]');
    this.cartCountElements = document.querySelectorAll('[id^="mini-cart-count"]');
    
    // State management
    this.isMenuOpen = false;
    this.currentUser = null;
    this.cartCount = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupScrollHeader();
    this.initAuth();
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

    // Auth links
    this.setupAuthListeners();

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
        
        // Close other dropdowns
        document.querySelectorAll('.mobile-nav .dropdown.active')
          .forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
          });
        
        // Toggle current dropdown
        dropdown.classList.toggle('active', !isActive);
      });
    });
  }

  setupDesktopDropdowns() {
    this.dropdowns.forEach(dropdown => {
      const link = dropdown.querySelector('a');
      const content = dropdown.querySelector('.dropdown-content');
      
      if (!link || !content) return;

      let hoverTimeout;
      
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        content.style.display = 'block';
      });
      
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          content.style.display = '';
        }, 150);
      });

      // Keyboard navigation
      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          content.style.display = 'block';
          const firstLink = content.querySelector('a');
          firstLink?.focus();
        }
      });
    });
  }

  setupAuthListeners() {
    // Login links
    document.querySelectorAll('.auth-login-link').forEach(link => {
      link.addEventListener('click', (e) => {
        // If you want to handle login via JS instead of navigation
        // e.preventDefault();
        // this.handleLogin();
      });
    });

    // Register links
    document.querySelectorAll('.auth-register-link').forEach(link => {
      link.addEventListener('click', (e) => {
        // If you want to handle registration via JS instead of navigation
        // e.preventDefault();
        // this.handleRegister();
      });
    });

    // Logout links
    document.querySelectorAll('.auth-logout-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });
  }

  initAuth() {
    // Check if user is logged in (you might get this from localStorage, sessionStorage, or API)
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    // Simulate checking auth status - replace with your actual auth logic
    try {
      const userData = JSON.parse(localStorage.getItem('bionix_user') || 'null');
      if (userData && userData.token) {
        this.setAuthenticatedState(userData);
      } else {
        this.setUnauthenticatedState();
      }
    } catch (error) {
      console.warn('Error checking auth status:', error);
      this.setUnauthenticatedState();
    }
  }

  setAuthenticatedState(user) {
    this.currentUser = user;
    
    this.authContainers.forEach(container => {
      const authLink = container.querySelector('.auth-loading');
      const loginLink = container.querySelector('.auth-login-link');
      const registerLink = container.querySelector('.auth-register-link');
      const profileLink = container.querySelector('.auth-profile-link');
      const logoutLink = container.querySelector('.auth-logout-link');
      
      if (authLink) {
        authLink.classList.remove('auth-loading');
        authLink.innerHTML = '<i class="fas fa-user"></i>';
        authLink.title = `Welcome, ${user.name || user.email || 'User'}`;
      }
      
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (profileLink) profileLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'block';
    });
  }

  setUnauthenticatedState() {
    this.currentUser = null;
    
    this.authContainers.forEach(container => {
      const authLink = container.querySelector('.auth-loading');
      const loginLink = container.querySelector('.auth-login-link');
      const registerLink = container.querySelector('.auth-register-link');
      const profileLink = container.querySelector('.auth-profile-link');
      const logoutLink = container.querySelector('.auth-logout-link');
      
      if (authLink) {
        authLink.classList.remove('auth-loading');
        authLink.innerHTML = '<i class="fas fa-user"></i>';
        authLink.title = 'Account';
      }
      
      if (loginLink) loginLink.style.display = 'block';
      if (registerLink) registerLink.style.display = 'block';
      if (profileLink) profileLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'none';
    });
  }

  handleLogout() {
    // Clear user data
    localStorage.removeItem('bionix_user');
    localStorage.removeItem('bionix_token');
    
    // Reset auth state
    this.setUnauthenticatedState();
    
    // Show success message (optional)
    this.showNotification('Successfully logged out!', 'success');
    
    // Redirect to home page
    window.location.href = window.BASE_PATH || '/';
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
    // Simple notification system - you can replace with your preferred notification library
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

  // Public API methods for external use
  updateUser(userData) {
    if (userData) {
      localStorage.setItem('bionix_user', JSON.stringify(userData));
      this.setAuthenticatedState(userData);
    } else {
      this.handleLogout();
    }
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

  getCurrentUser() {
    return this.currentUser;
  }

  getCartCount() {
    return this.cartCount;
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bionixHeader = new HeaderManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderManager;
}