// js/modules/uiComponents.js
export function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!menuToggle || !navMenu) {
    console.debug('Mobile menu elements not found');
    return;
  }

  const toggleMenu = (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  };

  const handleOutsideClick = (e) => {
    if (!navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  };

  // Clean up existing listeners
  menuToggle.removeEventListener('click', toggleMenu);
  document.removeEventListener('click', handleOutsideClick);

  // Add new listeners
  menuToggle.addEventListener('click', toggleMenu);
  document.addEventListener('click', handleOutsideClick);
}

export function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('a');
    const content = dropdown.querySelector('.dropdown-content');
    
    if (!toggle || !content) return;

    const toggleDropdown = (e) => {
      e.preventDefault();
      content.classList.toggle('show');
    };

    // Clean up existing listener
    toggle.removeEventListener('click', toggleDropdown);
    toggle.addEventListener('click', toggleDropdown);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
      });
    }
  });
}

// Export all UI initializers
export default {
  initMobileMenu,
  initDropdowns
};