import { formatPrice } from "./Utils.js";
import { API_BASE_URL } from "../apiConfig.js";

export async function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const url = `${API_BASE_URL}/products/featured`;
    console.log("Fetching from:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();
    console.log("Fetched:", featuredProducts); // ✅ log after initialization

    const baseUrl = API_BASE_URL.replace("/api", "");
   container.innerHTML = featuredProducts
  .map((product) => {
    const baseUrl = API_BASE_URL.replace("/api", "");
    const imageUrl = product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${baseUrl}${product.imageUrl}`;

    return `
      <div class="product-card">
        <a href="ecommerce/product-details.html?id=${product.id}">
          <img 
            src="${imageUrl}" 
            alt="${product.name}" 
            class="product-image"
            loading="lazy"
          />
          <h4>${product.name}</h4>
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
