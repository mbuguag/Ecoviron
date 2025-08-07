import { initCarousel } from "./modules/carousel.js";
import { initContactForm } from "./modules/contact.js";
import { initFeaturedProducts } from "./modules/featured-products.js";
import { initServices } from "./modules/services.js";
import { loadLayoutComponents } from "./modules/components.js";
import { initAboutSection } from "./modules/about.js";
import { updateMiniCartCount } from "./modules/cart-ui.js";
import { loadQuoteModal } from "./modules/quote-modal.js";
import { renderAuthArea } from "./modules/auth-display.js"; // ✅ optional modularization

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLayoutComponents();

    const initTasks = [];

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

    initTasks.push(updateMiniCartCount());

    renderAuthArea(); // ✅ moved out of main.js for clarity

    await Promise.all(initTasks);
  } catch (error) {
    console.error("Initialization error:", error);

    if (document.querySelector('[data-toggle="quote-modal"]')) {
      await loadQuoteModal();
    }

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
