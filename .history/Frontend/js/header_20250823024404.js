// header.js - Header functionality with authentication
import { authService } from './auth.js';
import { BASE_PATH } from './apiConfig.js';

class HeaderManager {
    constructor() {
        this.menuToggle = null;
        this.mobileNav = null;
        this.authContainer = null;
        this.overlay = null;
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.setupEventListeners();
        this.initAuth();
        this.replaceTemplateVariables();
        this.setupMobileDropdowns();
    }

    cacheDOMElements() {
        this.menuToggle = document.querySelector('.header-menu-toggle');
        this.mobileNav = document.querySelector('.mobile-nav');
        this.authContainer = document.getElementById('auth-container');
        this.authContainerMobile = document.getElementById('auth-container-mobile');
        this.overlay = document.querySelector('.menu-overlay');
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.menuToggle && this.mobileNav) {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-nav') && 
                !e.target.closest('.header-menu-toggle') && 
                this.mobileNav?.classList.contains('active')) {
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

        // Close when clicking overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close mobile nav when clicking close button
        const mobileCloseBtn = document.querySelector('.mobile-nav-close');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => this.closeMobileMenu());
        }

        // Desktop dropdown hover behavior
        this.setupDesktopDropdowns();
    }

    setupDesktopDropdowns() {
        const desktopDropdowns = document.querySelectorAll('.desktop-nav .dropdown');
        
        desktopDropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('open');
            });
            
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('open');
            });
        });
    }

    setupMobileDropdowns() {
        const mobileDropdownToggles = this.mobileNav?.querySelectorAll('.dropdown > .header-nav-link');
        
        if (mobileDropdownToggles) {
            mobileDropdownToggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        const dropdown = toggle.parentElement;
                        dropdown.classList.toggle('open');
                        
                        // Close other dropdowns when opening a new one
                        if (dropdown.classList.contains('open')) {
                            mobileDropdownToggles.forEach(otherToggle => {
                                if (otherToggle !== toggle) {
                                    otherToggle.parentElement.classList.remove('open');
                                }
                            });
                        }
                    }
                });
            });
        }
    }

    toggleMobileMenu() {
        this.menuToggle.classList.toggle('active');
        this.mobileNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileNav.classList.contains('active') ? 'hidden' : '';

        if (this.overlay) this.overlay.classList.toggle('active');

        this.menuToggle.setAttribute(
            'aria-expanded',
            this.menuToggle.classList.contains('active').toString()
        );
    }

    closeMobileMenu() {
        this.menuToggle.classList.remove('active');
        this.mobileNav.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';

        if (this.overlay) this.overlay.classList.remove('active');

        this.menuToggle.setAttribute('aria-expanded', 'false');
        
        // Close all mobile dropdowns when closing the menu
        const mobileDropdowns = this.mobileNav?.querySelectorAll('.dropdown');
        if (mobileDropdowns) {
            mobileDropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
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
        const authHTML = `
            <div class="user-dropdown">
                <a href="#" class="header-nav-link">
                    <img class="avatar-small" src="${profileImage}" alt="${user.username}"
                         onerror="this.src='${BASE_PATH}assets/icons/default-avatar.png'">
                    <span>${user.username?.split(" ")[0] || 'User'}</span>
                </a>
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
        
        this.authContainer.innerHTML = authHTML;
        if (this.authContainerMobile) {
            this.authContainerMobile.innerHTML = authHTML;
        }
    }

    renderLoggedOutState() {
        const authHTML = `
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
        
        this.authContainer.innerHTML = authHTML;
        if (this.authContainerMobile) {
            this.authContainerMobile.innerHTML = authHTML;
        }
    }

    setupAuthEventListeners() {
        // Event delegation for logout
        const handleAuthClick = (e) => {
            if (e.target.classList.contains('auth-logout-link') ||
                e.target.closest('.auth-logout-link')) {
                e.preventDefault();
                this.handleLogout();
            }
        };
        
        if (this.authContainer) {
            this.authContainer.addEventListener('click', handleAuthClick);
        }
        
        if (this.authContainerMobile) {
            this.authContainerMobile.addEventListener('click', handleAuthClick);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                const dropdowns = document.querySelectorAll('.user-dropdown .dropdown-content');
                dropdowns.forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
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