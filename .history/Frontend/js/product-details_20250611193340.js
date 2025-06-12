import { fetchProductById } from './api.js';
import { loadLayoutComponents } from './domUtils.js';

document.addEventListener("DOMContentLoaded", async () => {
  loadLayoutComponents();

  const productId = localStorage.getItem("selectedProductId");
  const container = document.getElementById("product-details");

  if (!productId) {
    container.innerHTML = "<p>No product selected.</p>";
    return;
  }

  try {
    const product = await fetchProductById(productId);
    container.innerHTML = `
      <div class="product-detail">
        <img src="${product.imageUrl}" alt="${product.name}" />
        <div class="info">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p class="price">KSh ${product.price}</p>
          <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = "<p>Error loading product details.</p>";
  }
});

function addToCart(productId) {
  // Implement cart logic here
  alert(`Product ${productId} added to cart!`);
}
