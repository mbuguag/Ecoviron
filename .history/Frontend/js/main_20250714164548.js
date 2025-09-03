import { initCarousel } from "./modules/carousel.js";
import { initContactForm } from "./modules/contact.js";
import { initFeaturedProducts } from "./modules/featured-products.js";
import { initServices } from "./modules/services.js";
import { loadLayoutComponents } from "./modules/components.js";
import { initAboutSection } from "./modules/about.js";
import { updateMiniCartCount } from "./cart-actions.js";
import { loadQuoteModal } from "./modules/quote-modal.js";
import { renderUserDropdown } from "./
renderUserDropdown();


window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLayoutComponents();

    const initTasks = [];

    // Optional: Load quote modal only if relevant button exists
    if (document.querySelector('[data-toggle="quote-modal"]')) {
      initTasks.push(loadQuoteModal());
    }

    // Queue other dynamic components
    if (document.getElementById("carousel-slide"))
      initTasks.push(initCarousel());
    if (document.getElementById("contactForm"))
      initTasks.push(initContactForm());
    if (document.getElementById("featured-products-grid"))
      initTasks.push(initFeaturedProducts());
    if (document.querySelector(".services-grid"))
      initTasks.push(initServices());
    if (document.getElementById("who-we-are-content"))
      initTasks.push(initAboutSection());

    // Always update cart badge
    initTasks.push(updateMiniCartCount());

    // Handle auth UI in header
    const authArea = document.getElementById("authArea");
    const token = localStorage.getItem("jwtToken");
    const userName = localStorage.getItem("userName");
    const profilePic = localStorage.getItem("profilePic");

    if (authArea) {
      authArea.innerHTML = token
        ? `
        <div class="user-info">
          <img src="${
            profilePic || "/frontend/assets/icons/user-default.jpg"
          }" alt="User" class="user-avatar">
          <span class="user-name">${userName || "User"}</span>
          <a href="/frontend/auth/logout.html" class="logout-btn">Logout</a>
        </div>`
        : `<a href="/frontend/auth/login.html" class="login-btn">Login</a>`;
    }

    await Promise.all(initTasks);
  } catch (error) {
    console.error("Initialization error:", error);

    // Minimal fallback header/footer if layout loading failed
    const header = document.getElementById("header-container");
    const footer = document.getElementById("footer-container");

    if (header && header.innerHTML.trim() === "") {
      header.innerHTML = `<header class="default-header"><a href="/">Ecoviron</a></header>`;
    }
    if (footer && footer.innerHTML.trim() === "") {
      footer.innerHTML = `<footer class="default-footer"><p>© ${new Date().getFullYear()} Ecoviron</p></footer>`;
    }
  }
});

// Make component functions available globally (optional)
window.initComponents = {
  carousel: initCarousel,
  contact: initContactForm,
  products: initFeaturedProducts,
  services: initServices,
};

// Export layout loading promise
export const layoutLoaded = (async () => {
  await loadLayoutComponents();

  const headerLoaded =
    document.getElementById("header-container")?.innerHTML.trim().length > 0;
  const footerLoaded =
    document.getElementById("footer-container")?.innerHTML.trim().length > 0;

  if (!headerLoaded || !footerLoaded) {
    throw new Error("Header or footer not loaded correctly");
  }

  return true;
})();

// Load checkout logic dynamically only on checkout page
if (window.location.pathname.includes("checkout")) {
  import("./checkout.js")
    .then(() => console.log("✅ checkout.js dynamically loaded"))
    .catch((err) => console.error("Failed to load checkout.js", err));
}
