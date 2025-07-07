import { loadLayoutComponents } from "./domUtils.js";
import { fetchAllProducts } from "./api.js";
import { setupCartInteractions } from "./cart-actions.js";
import { toggleWishlist, isInWishlist } from "./wishlist.js";

const BACKEND_URL = "http://localhost:8080";
let originalProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadAndRenderProducts();
  setupControls();
});

const API_BASE = {
  products: `${BACKEND_URL}/api/products`,
};

function getCategoryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "all";
}

async function loadAndRenderProducts() {
  try {
    const products = await fetchAllProducts();
    originalProducts = products;
    applyFiltersAndSort({});
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
      const rating = product.rating || 4; // Fallback rating

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
            <button class="wishlist-btn" data-id="${product.id}">
  <i class="fa${isInWishlist(product.id) ? "s" : "r"} fa-heart"></i>
</button>

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

  setupCartInteractions();
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

function setupControls() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCategory = btn.dataset.filter;
      applyFiltersAndSort({ category: selectedCategory });
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const selectedSort = sortSelect.value;
      applyFiltersAndSort({ sort: selectedSort });
    });
  }
}

function setActiveFilterButton(selectedCategory) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === selectedCategory);
  });
}

function applyFiltersAndSort({
  category = getCategoryFromQuery(),
  sort = document.getElementById("sort-select")?.value || "default",
}) {
  let filtered = [...originalProducts];

  
  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) => p.category?.name?.toLowerCase() === category.toLowerCase()
    );
  }


  function setupWishlistListeners() {
    const buttons = document.querySelectorAll(".wishlist-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.id);
        toggleWishlist(productId);
        btn.querySelector("i").classList.toggle("fas");
        btn.querySelector("i").classList.toggle("far");
      });
    });
  }


 
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProductGrid(filtered);
  setActiveFilterButton(category);
}

function formatPrice(price) {
  return `KES ${Number(price).toLocaleString()}`;
}
