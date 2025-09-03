// src/core/uiComponents.js
export function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');
  
  if (!toggle || !menu) return;

  // Remove previous listeners to avoid duplicates
  toggle.removeEventListener('click', toggleMenu);
  document.removeEventListener('click', closeMenuOnOutsideClick);

  // Add new listeners
  toggle.addEventListener('click', toggleMenu);
  document.addEventListener('click', closeMenuOnOutsideClick);

  function toggleMenu(e) {
    e.stopPropagation();
    menu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }

  function closeMenuOnOutsideClick(e) {
    if (!menu.contains(e.target)  {
      menu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }
}