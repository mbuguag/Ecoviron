// main.js — clean, modular entry point

document.addEventListener('DOMContentLoaded', () => {
  // Check and route based on page
  const path = window.location.pathname;

  if (path.includes('index.html') || path === '/' || path === '/index.html') {
    loadProducts(); // from products.js
  }

  if (path.includes('product-details.html')) {
    displayProductDetails(); // from product-details.js
  }

  if (path.includes('cart.html')) {
    loadCartItems(); // from cart.js
  }

  if (path.includes('checkout.html')) {
    setupCheckout(); // optional, from cart.js or a new file if separated
  }

  if (path.includes('blog.html')) {
    loadBlogPosts(); // from blog.js
  }

  // Auth logic on all pages
  setupAuth(); // from auth.js — sets up login/logout buttons
});
