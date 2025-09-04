import { formatPrice } from "./utils.js";
import { API_BASE_URL } from "../apiConfig.js";

export async function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/products/featured`);
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();
    const baseUrl = API_BASE_URL.replace("/api", "");

    const cardsHtml = featuredProducts
      .map((product) => {
        const imageUrl = product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `${baseUrl}${product.imageUrl}`;

        return `
          <div class="product-card">
            <a href="ecommerce/product-details.html?id=${
              product.id
            }" aria-label="View details for ${product.name}">
              <img 
                src="${imageUrl}" 
                alt="${product.name}" 
                class="product-image"
                loading="lazy"
                onerror="this.onerror=null;this.src='/assets/images/fallback.jpg'"
              />
              <h4 class="animated-text">${product.name}</h4>
              <p class="price">${formatPrice(product.price)}</p>
            </a>
          </div>
        `;
      })
      .join("");

    container.innerHTML = cardsHtml + cardsHtml; // Duplicate for seamless scroll
    setupFeaturedCarousel();
    setupAutoScroll();
  } catch (error) {
    console.error("Error loading featured products:", error);
    container.innerHTML = `<p class="error-message">Unable to load featured products at the moment.</p>`;
  }
}

function setupFeaturedCarousel() {
  const container = document.getElementById("featured-products-grid");
  const leftBtn = document.getElementById("carouselLeft");
  const rightBtn = document.getElementById("carouselRight");

  if (!container || !leftBtn || !rightBtn) return;

  const scrollAmount = 200; // Matches card width + gap

  leftBtn.addEventListener("click", () => {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    resetAutoScroll();
  });

  rightBtn.addEventListener("click", () => {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    resetAutoScroll();
  });

  // Hide buttons when at scroll extremes
  const checkScrollPosition = () => {
    leftBtn.style.visibility = container.scrollLeft > 0 ? "visible" : "hidden";
    rightBtn.style.visibility =
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
        ? "visible"
        : "hidden";
  };

  container.addEventListener("scroll", checkScrollPosition);
  checkScrollPosition();
}

let autoScrollInterval;
const SCROLL_DELAY = 3000; // 3 seconds between scrolls

function setupAutoScroll() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  // Reset any existing interval
  if (autoScrollInterval) clearInterval(autoScrollInterval);

  autoScrollInterval = setInterval(() => {
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft >= maxScroll - 1) {
      // If at end, smoothly scroll back to start
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      // Otherwise scroll right
      container.scrollBy({
        left: 3,
        behavior: "smooth",
      });
    }
  }, SCROLL_DELAY);

  // Pause auto-scroll on hover
  container.addEventListener("mouseenter", () => {
    clearInterval(autoScrollInterval);
  });

  container.addEventListener("mouseleave", () => {
    setupAutoScroll();
  });
}

function resetAutoScroll() {
  clearInterval(autoScrollInterval);
  setupAutoScroll();
}
