// BIONIX-EHS Header JavaScript Module (delegation-based)
class HeaderManager {
  constructor() {
    this.header = document.querySelector('.site-header');

    // State management
    this.isMenuOpen = false;
    this.currentUser = null;
    this.cartCount = 0;

    this.init();
  }

  init() {
    this.setupDelegatedListeners();
    this.setupScrollHeader();
    this.initAuth();
    this.initCart();
    this.setupAccessibility();
    this.handleResize();
  }

  // ------------------------------
  // 🔹 Delegated Event Listeners
  // ------------------------------
  setupDelegatedListeners() {
    const root = document; // safer than binding to header (header gets swapped)

    root.addEventListener('click', (e) => {
      const target = e.target;

      // Mobile menu toggle
      if (target.closest('.header-menu-toggle')) {
        e.preventDefault();
        this.toggleMobileMenu();
        return;
      }

      // Mobile nav close
      if (target.closest('.mobile-nav-close')) {
        e.preventDefault();
        this.closeMobileMenu();
        return;
      }

      // Menu overlay
      if (target.closest('.menu-overlay')) {
        e.preventDefault();
        this.closeMobileMenu();
        return;
      }

      // Mobile dropdowns
      const mobileDropdownLink = target.closest('.mobile-nav .dropdown > a');
      if (mobileDropdownLink) {
        e.preventDefault();
        const dropdown = mobileDropdownLink.closest('.dropdown');
        const isActive = dropdown.classList.contains('active');

        // Close others
        document.querySelectorAll('.mobile-nav .dropdown.active')
          .forEach(d => { if (d !== dropdown) d.classList.remove('active'); });

        dropdown.classList.toggle('active', !isActive);
        return;
      }

      // Cart icon
      if (target.closest('.cart-icon')) {
        e.preventDefault();
        this.openMiniCart?.();
        return;
      }

      // Auth actions
      if (target.closest('.auth-login-link')) {
        // optional custom login handling
        return;
      }

      if (target.closest('.auth-register-link')) {
        // optional custom register handling
        return;
      }

      if (target.closest('.auth-logout-link')) {
        e.preventDefault();
        this.handleLogout();
        return;
      }
    });

    // Escape key closes mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Window events
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('scroll', () => this.handleScroll());
  }

  // ------------------------------
  // Scroll + Resize Handling
  // ------------------------------
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

  handleResize() {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // ------------------------------
  // Mobile Menu
  // ------------------------------
  toggleMobileMenu() {
    this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    document.querySelector('.header-menu-toggle')?.classList.add('active');
    document.querySelector('.mobile-nav')?.classList.add('active');
    document.querySelector('.menu-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus management
    document.querySelector('.mobile-nav-close')?.focus();

    // Update aria-expanded
    document.querySelector('.header-menu-toggle')?.setAttribute('aria-expanded', 'true');
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    document.querySelector('.header-menu-toggle')?.classList.remove('active');
    document.querySelector('.mobile-nav')?.classList.remove('active');
    document.querySelector('.menu-overlay')?.classList.remove('active');
    document.body.style.overflow = '';

    // Close mobile dropdowns
    document.querySelectorAll('.mobile-nav .dropdown.active')
      .forEach(dropdown => dropdown.classList.remove('active'));

    // Update aria-expanded
    document.querySelector('.header-menu-toggle')?.setAttribute('aria-expanded', 'false');

    // Return focus
    document.querySelector('.header-menu-toggle')?.focus();
  }

  // ------------------------------
  // Auth
  // ------------------------------
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

    document.querySelectorAll('[id^="auth-container"]').forEach(container => {
      container.querySelector('.auth-login-link')?.style.setProperty('display', 'none');
      container.querySelector('.auth-register-link')?.style.setProperty('display', 'none');
      container.querySelector('.auth-profile-link')?.style.setProperty('display', 'block');
      container.querySelector('.auth-logout-link')?.style.setProperty('display', 'block');

      const authLink = container.querySelector('.auth-loading');
      if (authLink) {
        authLink.classList.remove('auth-loading');
        authLink.innerHTML = '<i class="fas fa-user"></i>';
        authLink.title = `Welcome, ${user.name || user.email || 'User'}`;
      }
    });
  }

  setUnauthenticatedState() {
    this.currentUser = null;

    document.querySelectorAll('[id^="auth-container"]').forEach(container => {
      container.querySelector('.auth-login-link')?.style.setProperty('display', 'block');
      container.querySelector('.auth-register-link')?.style.setProperty('display', 'block');
      container.querySelector('.auth-profile-link')?.style.setProperty('display', 'none');
      container.querySelector('.auth-logout-link')?.style.setProperty('display', 'none');

      const authLink = container.querySelector('.auth-loading');
      if (authLink) {
        authLink.classList.remove('auth-loading');
        authLink.innerHTML = '<i class="fas fa-user"></i>';
        authLink.title = 'Account';
      }
    });
  }

  handleLogout() {
    localStorage.removeItem('bionix_user');
    localStorage.removeItem('bionix_token');
    this.setUnauthenticatedState();
    this.showNotification('Successfully logged out!', 'success');
    window.location.href = window.BASE_PATH || '/';
  }

  // ------------------------------
  // Cart
  // ------------------------------
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
    } catch {
      this.updateCartCount(0);
    }
  }

  updateCartCount(count) {
    this.cartCount = count;
    document.querySelectorAll('[id^="mini-cart-count"]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ------------------------------
  // Accessibility
  // ------------------------------
  setupAccessibility() {
    document.querySelector('.header-menu-toggle')
      ?.setAttribute('aria-label', 'Toggle navigation menu');
    document.querySelector('.mobile-nav')
      ?.setAttribute('role', 'navigation');
    document.querySelector('.mobile-nav')
      ?.setAttribute('aria-label', 'Mobile navigation');

    this.setupFocusTrap();
  }

  setupFocusTrap() {
    const focusable = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    document.addEventListener('keydown', (e) => {
      if (!this.isMenuOpen || e.key !== 'Tab') return;

      const focusableEls = document.querySelector('.mobile-nav')?.querySelectorAll(focusable);
      if (!focusableEls || focusableEls.length === 0) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  }

  // ------------------------------
  // Utilities
  // ------------------------------
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
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Public API
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

  getCurrentUser() { return this.currentUser; }
  getCartCount() { return this.cartCount; }
}

// Init once
document.addEventListener('DOMContentLoaded', () => {
  window.bionixHeader = new HeaderManager();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderManager;
}
