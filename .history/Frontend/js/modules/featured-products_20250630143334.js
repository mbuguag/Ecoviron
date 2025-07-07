import { formatPrice } from "./Utils.js";
import { API_BASE_URL } from "../apiConfig.js";

export async function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();
    const baseUrl = API_BASE_URL.replace("/api", "");

    container.innerHTML = featuredProducts
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
                onerror="this.src='assets/images/fallback.jpg'"
              />
              <h4 class="animated-text">${product.name}</h4>
              <p class="price">${formatPrice(product.price)}</p>
            </a>
          </div>
        `;
      })
      .join("");

    setupFeaturedCarousel();
  } catch (error) {
    console.error("Error loading featured products:", error);
    container.innerHTML = `<p class="error-message">Unable to load featured products at the moment.</p>`;
  }
}

// === Carousel Scroll Buttons ===
function setupFeaturedCarousel() {
  const container = document.getElementById("featured-products-grid");
  const leftBtn = document.getElementById("carouselLeft");
  const rightBtn = document.getElementById("carouselRight");

  if (!container || !leftBtn || !rightBtn) return;

  const scrollAmount = 150;

  leftBtn.addEventListener("click", () => {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
}
