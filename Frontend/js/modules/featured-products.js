import { formatPrice } from "./Utils.js";
import { API_BASE_URL } from "../apiConfig.js";

export async function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();

    container.innerHTML = featuredProducts
      .map((product) => {
        const imageUrl = product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `${API_BASE_URL.replace("/api", "")}/${product.imageUrl}`;

        return `
          <div class="product-card">
            <a href="ecommerce/product-details.html?id=${product.id}">
              <img src="${imageUrl}" alt="${product.name}" loading="lazy">
              <h4 class="animated-text">${product.name}</h4>
              <p class="price">${formatPrice(product.price)}</p>
            </a>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading featured products:", error);
    container.innerHTML = `<p class="error-message">Unable to load featured products at the moment.</p>`;
  }
}
