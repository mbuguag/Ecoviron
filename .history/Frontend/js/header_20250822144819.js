// header.js - Simplified working version
class HeaderManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupAuth();
        this.setupDropdowns();
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.header-menu-toggle');
        const navMenu = document.querySelector('.header-nav-list');

        if (!menuToggle || !navMenu) return;

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.site-header') && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    setupAuth() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        // Check if user is logged in (simplified version)
        const user = this.getCurrentUser();
        
        if (user) {
            this.renderLoggedInState(user);
        } else {
            this.renderLoggedOutState();
        }

        this.setupAuthEvents();
    }

    getCurrentUser() {
        // Check localStorage for user data
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    renderLoggedInState(user) {
        const authContainer = document.getElementById('auth-container');
        const userName = user.username || 'User';
        const userInitials = this.getUserInitials(userName);

        authContainer.innerHTML = `
            <div class="user-dropdown">
                <div class="user-info">
                    <div class="user-initials">${userInitials}</div>
                    <span class="user-name">${userName.split(" ")[0]}</span>
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
    }

    renderLoggedOutState() {
        const authContainer = document.getElementById('auth-container');
        authContainer.innerHTML = `
            <div class="user-dropdown">
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
    }

    getUserInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    }

    setupAuthEvents() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        // Event delegation for logout
        authContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-logout-link') || 
                e.target.closest('.auth-logout-link')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupDropdowns() {
        // Handle all dropdowns in the header
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-content').style.display = 'none';
                    }
                });

                // Toggle current dropdown
                const content = dropdown.querySelector('.dropdown-content');
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            dropdowns.forEach(dropdown => {
                dropdown.querySelector('.dropdown-content').style.display = 'none';
            });
        });
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    async handleLogout() {
        try {
            // Clear user data
            localStorage.removeItem('user');
            localStorage.removeItem('jwtToken');
            
            this.showNotification('Logged out successfully!', 'success');
            
            // Re-render auth state
            this.renderLoggedOutState();
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/index.html';
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HeaderManager();
});

// For testing - simulate login
window.simulateLogin = function(username = 'Admin User') {
    localStorage.setItem('user', JSON.stringify({ username }));
    localStorage.setItem('jwtToken', 'test-token');
    window.location.reload();
};

// For testing - simulate logout
window.simulateLogout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    window.location.reload();
};