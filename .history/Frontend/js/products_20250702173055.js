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

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return "★".repeat(fullStars) + "☆".repeat(emptyStars);
}


function setupFilterButtons() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;
      applyFiltersAndSort({ category: selectedCategory });
    });
  });

  const sortSelect = document.getElementById("sort-select");
  sortSelect.addEventListener("change", () => {
    const selectedSort = sortSelect.value;
    applyFiltersAndSort({ sort: selectedSort });
  });
}

let originalProducts = [];

async function loadAndRenderProducts() {
  try {
    const products = await fetchAllProducts();
    originalProducts = products;
    renderProductGrid(products);
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

function applyFiltersAndSort({
  category = getCategoryFromQuery(),
  sort = "default",
}) {
  let filtered = [...originalProducts];

  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) => p.category?.name?.toLowerCase() === category.toLowerCase()
    );
  }

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProductGrid(filtered);
  setupCartInteractions();
}



function formatPrice(price) {
  return `KES ${price.toLocaleString()}`;
}
