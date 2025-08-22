// header.js - Header functionality with authentication
import { authService } from './auth.js';
import { BASE_PATH } from './apiConfig.js';

class HeaderManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.cacheDOMElements();
        this.setupEventListeners();
        this.setupAuth();
        this.isInitialized = true;
        
        console.log('Header manager initialized');
    }

    cacheDOMElements() {
        this.menuToggle = document.querySelector('.header-menu-toggle');
        this.navMenu = document.querySelector('.header-nav-list');
        this.authContainer = document.getElementById('auth-container');
        this.allDropdowns = document.querySelectorAll('.dropdown');
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
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

        // Handle all dropdowns
        this.setupDropdowns();
    }

    setupDropdowns() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Handle dropdown clicks
        this.allDropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('a');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    this.closeOtherDropdowns(dropdown);
                    
                    // Toggle current dropdown
                    this.toggleDropdown(dropdown);
                });
            }
        });

        // Prevent dropdown content from closing when clicking inside
        this.allDropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                content.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }

    toggleDropdown(dropdown) {
        const content = dropdown.querySelector('.dropdown-content');
        if (!content) return;

        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        
        // Add animation class
        if (!isVisible) {
            content.classList.add('dropdown-active');
        } else {
            content.classList.remove('dropdown-active');
        }
    }

    closeOtherDropdowns(currentDropdown) {
        this.allDropdowns.forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                const content = dropdown.querySelector('.dropdown-content');
                if (content) {
                    content.style.display = 'none';
                    content.classList.remove('dropdown-active');
                }
            }
        });
    }

    closeAllDropdowns() {
        this.allDropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                content.style.display = 'none';
                content.classList.remove('dropdown-active');
            }
        });
    }

    toggleMobileMenu() {
        this.menuToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        const isExpanded = this.menuToggle.classList.contains('active');
        this.menuToggle.setAttribute('aria-expanded', isExpanded.toString());
    }

    closeMobileMenu() {
        this.menuToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }

    setupAuth() {
        if (!this.authContainer) {
            console.warn('Auth container not found');
            return;
        }

        // Check auth status and render accordingly
        this.checkAuthStatus();
        
        // Set up auth event listeners
        this.setupAuthEvents();
    }

    checkAuthStatus() {
        const user = this.getCurrentUser();
        
        if (user) {
            this.renderLoggedInState(user);
        } else {
            this.renderLoggedOutState();
        }
    }

    getCurrentUser() {
        // Check if user is logged in (simplified version)
        try {
            const token = localStorage.getItem('jwtToken');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return null;
    }

    renderLoggedInState(user) {
        const userName = user.username || user.name || 'User';
        const userInitials = this.getUserInitials(userName);
        const profileImage = user.profileImage || '';

        this.authContainer.innerHTML = `
            <div class="dropdown">
                <div class="user-info">
                    ${profileImage ? `
                        <img src="${profileImage}" alt="${userName}" class="avatar-small" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    ` : ''}
                    <div class="user-initials" style="${profileImage ? 'display: none;' : ''}">
                        ${userInitials}
                    </div>
                    <span class="user-name">${userName.split(' ')[0]}</span>
                </div>
                <div class="dropdown-content">
                    <a href="/profile.html" class="auth-profile-link">
                        <i class="fas fa-user-circle"></i> Profile
                    </a>
                    <a href="#" class="auth-logout-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;

        // Re-initialize dropdown for the auth area
        this.allDropdowns = document.querySelectorAll('.dropdown');
        this.setupDropdowns();
    }

    renderLoggedOutState() {
        this.authContainer.innerHTML = `
            <div class="dropdown">
                <a href="#" class="header-nav-link">
                    <i class="fas fa-user"></i> Account
                </a>
                <div class="dropdown-content">
                    <a href="/auth/login.html" class="auth-login-link">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="/auth/register.html" class="auth-register-link">
                        <i class="fas fa-user-plus"></i> Register
                    </a>
                </div>
            </div>
        `;

        // Re-initialize dropdown for the auth area
        this.allDropdowns = document.querySelectorAll('.dropdown');
        this.setupDropdowns();
    }

    getUserInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    }

    setupAuthEvents() {
        // Use event delegation for auth actions
        document.addEventListener('click', (e) => {
            // Logout handling
            if (e.target.classList.contains('auth-logout-link') || 
                e.target.closest('.auth-logout-link')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
            }
            
            // Login/register links - let them work normally
        });
    }

    async handleLogout() {
        try {
            // Clear authentication data
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('profileImage');
            
            this.showNotification('Logged out successfully!', 'success');
            
            // Update UI
            setTimeout(() => {
                this.checkAuthStatus();
                window.location.href = '/';
            }, 1000);
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

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

    // Public method to refresh auth state
    refreshAuth() {
        this.checkAuthStatus();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add slight delay to ensure all elements are loaded
    setTimeout(() => {
        window.headerManager = new HeaderManager();
    }, 100);
});

// Global functions for testing
window.simulateLogin = function(username = 'Admin User', profileImage = '') {
    localStorage.setItem('jwtToken', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
        username: username,
        name: username,
        profileImage: profileImage
    }));
    window.location.reload();
};

window.simulateLogout = function() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.reload();
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderManager;
}