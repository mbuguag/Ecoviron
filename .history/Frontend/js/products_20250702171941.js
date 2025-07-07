import { loadLayoutComponents } from "./domUtils.js";
import { fetchAllProducts } from "./api.js";
import { setupCartInteractions } from "./cart-actions.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadAndRenderProducts();
  setupFilterButtons();
});

const BACKEND_URL = "http://localhost:8080";

const API_BASE = {
  products: `${BACKEND_URL}/api/products`
 
};
function getCategoryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "all";
}

async function loadAndRenderProducts() {
  try {
    const products = await fetchAllProducts();
    const category = getCategoryFromQuery();

    renderProductGrid(products);
    filterProducts(category);
    setupCartInteractions();
  } catch (error) {
    document.getElementById("product-grid").innerHTML = `
      <div class="error-message">
        <p>Failed to load products. Please try again later.</p>
      </div>
    `;
    console.error("API Error:", error);
  }
}

function renderProductGrid(products) {
  const gridContainer = document.getElementById("product-grid");
  gridContainer.innerHTML = products
    .map((product) => {
      const badge = product.tags?.includes("eco")
        ? "Eco"
        : product.tags?.includes("new")
        ? "New"
        : "";
      const rating = product.rating || 4; // Default fallback

      return `
      <div class="product-card modern-card" data-category="${
        product.category?.name?.toLowerCase() || "uncategorized"
      }">
        <a href="product-details.html?id=${
          product.id
        }" class="product-image-link">
          <div class="image-wrapper">
            <img 
              src="${BACKEND_URL}${product.imageUrl}" 
              alt="${product.name}" 
              class="product-image"
              loading="lazy"
            />
            ${badge ? `<span class="badge">${badge}</span>` : ""}
          </div>
        </a>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-price">${formatPrice(product.price)}</p>
          <div class="rating">
            ${renderStars(rating)}
          </div>
          <button class="btn add-to-cart"
            data-product-id="${product.id}"
            data-product-name="${product.name}"
            data-product-price="${product.price}">
            Add to Cart
          </button>
        </div>
      </div>
      `;
    })
    .join("");
}


function setupFilterButtons() {
  const currentCategory = getCategoryFromQuery();
  const filterLinks = document.querySelectorAll(".filter-link");

  filterLinks.forEach((link) => {
    const button = link.querySelector("button");
    const btnFilter = button.dataset.filter;

    if (btnFilter === currentCategory) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }

    button.addEventListener("click", () => {
      filterProducts(btnFilter);
      window.history.pushState({}, "", `?category=${btnFilter}`);
      setupFilterButtons();
    });
  });
}

function filterProducts(filter) {
  const allProducts = document.querySelectorAll(".product-card");
  allProducts.forEach((product) => {
    const category = product.dataset.category.toLowerCase();
    product.style.display =
      filter === "all" || category === filter.toLowerCase() ? "block" : "none";
  });
}

function formatPrice(price) {
  return `KES ${price.toLocaleString()}`;
}
