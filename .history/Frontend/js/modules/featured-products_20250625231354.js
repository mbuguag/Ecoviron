import { formatPrice } from "./Utils.js";
import { API_BASE_URL } from "../apiConfig.js";

export async function initFeaturedProducts() {
  const track = document.getElementById("featured-carousel-track");
  if (!track) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();
    const baseUrl = API_BASE_URL.replace("/api", "");

    track.innerHTML = featuredProducts
      .map((product) => {
        const imageUrl = `${baseUrl}${product.imageUrl}`;
        return `
          <div class="product-card">
            <a href="ecommerce/product-details.html?id=${product.id}">
              <img 
                src="${imageUrl}" 
                alt="${product.name}" 
                class="product-image"
                loading="lazy"
              />
              <h4 class="animated-text">${product.name}</h4>
              <p class="price">${formatPrice(product.price)}</p>
            </a>
          </div>
        `;
      })
      .join("");

    setupFeaturedCarousel(track, featuredProducts.length);
  } catch (error) {
    console.error("Error loading featured products:", error);
    track.innerHTML = `<p class="error-message">Unable to load featured products at the moment.</p>`;
  }
}

function setupFeaturedCarousel(track, itemCount) {
  const prevBtn = document.getElementById("prevFeaturedBtn");
  const nextBtn = document.getElementById("nextFeaturedBtn");

  const cardWidth = 270; // Adjust according to your CSS
  let currentIndex = 0;
  const visibleItems = Math.floor(track.parentElement.offsetWidth / cardWidth);
  const maxIndex = itemCount - visibleItems;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  window.addEventListener("resize", () => {
    currentIndex = 0;
    updateCarousel();
  });
}
