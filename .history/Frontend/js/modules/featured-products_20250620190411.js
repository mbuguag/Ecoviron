import { formatPrice } from './Utils.js';
import {}

// const featuredProducts = [
//   {
//     name: "Reusable Water Bottle",
//     price: 850,
//     image: "assets/images/products/water-bottle.jpg",
//     id: 1
//   },
//   // ... other products
// ];

export async function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const response = await fetch("/api/products/featured");
    if (!response.ok) throw new Error("Failed to fetch featured products");

    const featuredProducts = await response.json();

    container.innerHTML = featuredProducts
      .map(
        (product) => `
      <div class="product-card">
        <a href="ecommerce/product-details.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <h4 class="animated-text">${product.name}</h4>
          <p class="price">${formatPrice(product.price)}</p>
        </a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading featured products:", error);
    container.innerHTML = `<p class="error-message">Unable to load featured products at the moment.</p>`;
  }
}