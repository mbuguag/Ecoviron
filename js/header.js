// header.js - Header functionality with authentication
import { authService } from './auth.js';
import { BASE_PATH } from './apiConfig.js';

class HeaderManager {
    constructor() {
        this.menuToggle = null;
        this.navMenu = null;
        this.authContainer = null;
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.setupEventListeners();
        this.initAuth();
        this.replaceTemplateVariables();
    }

    cacheDOMElements() {
        this.menuToggle = document.querySelector('.header-menu-toggle');
        this.navMenu = document.querySelector('.header-nav-list');
        this.authContainer = document.getElementById('auth-container');
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.site-header') && this.navMenu?.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeAllDropdowns();
            }
        });
    }

    toggleMobileMenu() {
        this.menuToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        this.menuToggle.setAttribute('aria-expanded', 
            this.menuToggle.classList.contains('active'));
    }

    closeMobileMenu() {
        this.menuToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    async initAuth() {
        if (!this.authContainer) return;

        try {
            const user = authService.getCurrentUser();
            
            if (authService.isLoggedIn() && user) {
                this.renderLoggedInState(user);
            } else {
                this.renderLoggedOutState();
            }

            this.setupAuthEventListeners();

        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.renderLoggedOutState();
        }
    }

    renderLoggedInState(user) {
        const profileImage = authService.getProfileImage();
        
        this.authContainer.innerHTML = `
            <div class="user-dropdown">
                <img class="avatar-small" src="${profileImage}" alt="${user.username}" 
                     onerror="this.src='${BASE_PATH}assets/icons/default-avatar.png'">
                <span>${user.username?.split(" ")[0] || 'User'}</span>
                <div class="dropdown-content">
                    <span class="dropdown-header">My Account</span>
                    <a href="${BASE_PATH}profile.html" class="auth-profile-link">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="#" class="auth-logout-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
    }

    renderLoggedOutState() {
        this.authContainer.innerHTML = `
            <div class="user-dropdown">
                <a href="#" class="header-nav-link">
                    <i class="fas fa-user"></i> Account
                </a>
                <div class="dropdown-content">
                    <span class="dropdown-header">My Account</span>
                    <a href="${BASE_PATH}auth/login.html" class="auth-login-link">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="${BASE_PATH}auth/register.html" class="auth-register-link">
                        <i class="fas fa-user-plus"></i> Register
                    </a>
                </div>
            </div>
        `;
    }

    setupAuthEventListeners() {
        // Event delegation for logout
        this.authContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-logout-link') || 
                e.target.closest('.auth-logout-link')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    async handleLogout() {
        try {
            await authService.logout();
            this.showNotification('Logged out successfully!', 'success');
            
            // Re-render auth state
            this.renderLoggedOutState();
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = `${BASE_PATH}index.html`;
            }, 1000);
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    replaceTemplateVariables() {
        // Replace BASE_PATH in all links
        const links = document.querySelectorAll('a[href*="${BASE_PATH}"]');
        links.forEach(link => {
            link.href = link.href.replace('${BASE_PATH}', BASE_PATH);
        });

        // Replace in other elements if needed
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            if (el.textContent.includes('${BASE_PATH}')) {
                el.textContent = el.textContent.replace('${BASE_PATH}', BASE_PATH);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HeaderManager();
});

// Export for manual initialization if needed
export default HeaderManager;