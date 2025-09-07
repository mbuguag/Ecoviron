//header.js - Enhanced with improved mobile responsiveness

import { formatPrice } from "./modules/utils.js";
import { API_BASE_URL, BASE_PATH } from "./apiConfig.js";

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
    this.scrollTicking = false;
    this.resizeTimeout = null;
    
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
    // Mobile menu toggle - Enhanced
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
      
      // Touch events for better mobile experience
      this.menuToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
      });
    }

    if (this.mobileNavClose) {
      this.mobileNavClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      });
    }

    if (this.menuOverlay) {
      this.menuOverlay.addEventListener('click', () => this.closeMobileMenu());
      // Touch events for overlay
      this.menuOverlay.addEventListener('touchstart', () => this.closeMobileMenu());
    }

    // Mobile dropdown handling
    this.setupMobileDropdowns();

    // Desktop dropdown handling
    this.setupDesktopDropdowns();

    // Auth links
    this.setupAuthListeners();

    // Window events - Enhanced
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 150));
    window.addEventListener('orientationchange', () => {
      // Handle orientation change with delay for proper viewport calculation
      setTimeout(() => this.handleResize(), 300);
    });
    
    // Keyboard events - Enhanced
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Handle Tab key for focus trapping
      if (e.key === 'Tab' && this.isMenuOpen) {
        this.handleTabKeyInMenu(e);
      }
    });

    // Prevent scroll when menu is open on touch devices
    document.addEventListener('touchmove', (e) => {
      if (this.isMenuOpen && !this.mobileNav.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  setupScrollHeader() {
    window.addEventListener('scroll', () => {
      if (!this.scrollTicking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          this.scrollTicking = false;
        });
        this.scrollTicking = true;
      }
    }, { passive: true });
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
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    
    // Add classes with slight delay for smoother animation
    this.menuToggle?.classList.add('active');
    requestAnimationFrame(() => {
      this.mobileNav?.classList.add('active');
      this.menuOverlay?.classList.add('active');
    });
    
    // Prevent body scroll
    this.lockBodyScroll();
    
    // ARIA and focus management
    this.menuToggle?.setAttribute('aria-expanded', 'true');
    
    // Focus the close button or first menu item
    setTimeout(() => {
      const firstFocusable = this.getFirstFocusableElement();
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
    
    // Add event listener for outside clicks
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 10);
  }

  closeMobileMenu() {
    if (!this.isMenuOpen) return;
    
    this.isMenuOpen = false;
    this.menuToggle?.classList.remove('active');
    this.mobileNav?.classList.remove('active');
    this.menuOverlay?.classList.remove('active');
    
    // Restore body scroll
    this.unlockBodyScroll();
    
    // Close any open dropdowns
    this.closeAllMobileDropdowns();
    
    // ARIA and focus management
    this.menuToggle?.setAttribute('aria-expanded', 'false');
    this.menuToggle?.focus();
    
    // Remove outside click listener
    document.removeEventListener('click', this.handleOutsideClick);
  }

  lockBodyScroll() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('menu-open');
  }

  unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('menu-open');
  }

  handleOutsideClick = (e) => {
    if (!this.mobileNav?.contains(e.target) && 
        !this.menuToggle?.contains(e.target)) {
      this.closeMobileMenu();
    }
  }

  setupMobileDropdowns() {
    const mobileDropdowns = document.querySelectorAll('.mobile-nav .dropdown > a');
    
    mobileDropdowns.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = link.closest('.dropdown');
        const isActive = dropdown.classList.contains('active');
        
        // Close other dropdowns
        this.closeAllMobileDropdowns();
        
        // Toggle current dropdown
        if (!isActive) {
          dropdown.classList.add('active');
          // Add smooth height animation
          const content = dropdown.querySelector('.dropdown-content');
          if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });
    });
  }

  closeAllMobileDropdowns() {
    document.querySelectorAll('.mobile-nav .dropdown.active').forEach(dropdown => {
      dropdown.classList.remove('active');
      const content = dropdown.querySelector('.dropdown-content');
      if (content) {
        content.style.maxHeight = '0';
      }
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

      // Enhanced keyboard navigation
      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          content.style.display = 'block';
          const firstLink = content.querySelector('a');
          firstLink?.focus();
        }
      });

      // Handle dropdown item navigation
      const dropdownLinks = content.querySelectorAll('a');
      dropdownLinks.forEach((dropdownLink, index) => {
        dropdownLink.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextLink = dropdownLinks[index + 1];
            if (nextLink) nextLink.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevLink = dropdownLinks[index - 1];
            if (prevLink) {
              prevLink.focus();
            } else {
              link.focus();
            }
          } else if (e.key === 'Escape') {
            content.style.display = '';
            link.focus();
          }
        });
      });
    });
  }

  setupAuthListeners() {
    // Login links
    document.querySelectorAll('.auth-login-link').forEach(link => {
      link.addEventListener('click', (e) => {
        // Close mobile menu if open
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });

    // Register links
    document.querySelectorAll('.auth-register-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
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

  // Focus management for accessibility
  getFirstFocusableElement() {
    const focusableElements = this.mobileNav?.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    return focusableElements?.[0];
  }

  getLastFocusableElement() {
    const focusableElements = this.mobileNav?.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    return focusableElements?.[focusableElements.length - 1];
  }

  handleTabKeyInMenu(e) {
    const firstFocusable = this.getFirstFocusableElement();
    const lastFocusable = this.getLastFocusableElement();
    
    if (!firstFocusable || !lastFocusable) return;
    
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
  }

  initAuth() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
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
    localStorage.removeItem('bionix_user');
    localStorage.removeItem('bionix_token');
    this.setUnauthenticatedState();
    this.showNotification('Successfully logged out!', 'success');
    window.location.href = window.BASE_PATH || '/';
  }

  initCart() {
    this.loadCartCount();
    
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
    this.menuToggle?.setAttribute('aria-label', 'Toggle navigation menu');
    this.menuToggle?.setAttribute('aria-expanded', 'false');
    this.mobileNav?.setAttribute('role', 'navigation');
    this.mobileNav?.setAttribute('aria-label', 'Mobile navigation');
    
    // Add skip link for keyboard users
    this.addSkipLink();
  }

  addSkipLink() {
    if (document.querySelector('.skip-link')) return;
    
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-color);
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 4px;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      // Close mobile menu when resizing to desktop
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Recalculate dropdown positions if needed
      this.recalculateDropdowns();
    }, 100);
  }

  recalculateDropdowns() {
    // Recalculate dropdown positions on resize
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => {
      if (dropdown.style.display === 'block') {
        const rect = dropdown.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          dropdown.style.left = 'auto';
          dropdown.style.right = '0';
        }
      }
    });
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showNotification(message, type = 'info') {
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
    
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
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