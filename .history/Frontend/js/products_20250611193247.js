import { fetchProducts } from './api.js';
import { loadLayoutComponents } from './domUtils.js';

document.addEventListener("DOMContentLoaded", async () => {
  loadLayoutComponents();

  const productGrid = document.getElementById("product-grid");
  try {
    const products = await fetchProducts();
    productGrid.innerHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.imageUrl}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">KSh ${product.price}</p>
      </div>
    `).join("");

    // Add click event to each card
    document.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        localStorage.setItem("selectedProductId", id);
        window.location.href = "product-details.html";
      });
    });
  } catch (error) {
    productGrid.innerHTML = "<p>Error loading products.</p>";
  }
});
