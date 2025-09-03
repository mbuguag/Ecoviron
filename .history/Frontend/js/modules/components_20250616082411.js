
export async function loadComponents() {
  try {
    // Load header
    const headerResponse = await fetch('/components/header.html');
    if (!headerResponse.ok) throw new Error('Failed to load header');
    document.getElementById('header-container').innerHTML = await headerResponse.text();
    
    // Load footer
    const footerResponse = await fetch('/components/footer.html');
    if (!footerResponse.ok) throw new Error('Failed to load footer');
    document.getElementById('footer-container').innerHTML = await footerResponse.text();
    
    // Initialize any header/footer scripts
    initDynamicHeader();
    initFooterYear();
  } catch (error) {
    console.error('Component loading error:', error);
    // Fallback content
    document.getElementById('header-container').innerHTML = '<h1>Ecoviron</h1>';
    document.getElementById('footer-container').innerHTML = '<p>© ' + new Date().getFullYear() + ' Ecoviron</p>';
  }
}

function initDynamicHeader() {
  // Mobile menu toggle (example)
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.nav-menu').classList.toggle('active');
    });
  }
}

function initFooterYear() {
  // Update year automatically
  document.querySelector('#currentYear').textContent = new Date().getFullYear();
}