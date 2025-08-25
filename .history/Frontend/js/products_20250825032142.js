import { loadLayoutComponents } from "./domUtils.js";
import { fetchAllProducts } from "./api.js";
import { setupCartInteractions } from "./cart-actions.js";
import { toggleWishlist, isInWishlist } from "./wishlist.js";
import { API_BASE_URL, STATIC_BASE_URL, formatPrice } from "./config.js";

let originalProducts = [];
let filterTimeout;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadAndRenderProducts();
  setupControls();
});

/** Environment-safe API URL */
const API_BASE = {
  products: `${API_BASE_URL}/products`,
};

/** Get category from query string */
function getCategoryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "all";
}

/** Load all products and render grid */
async function loadAndRenderProducts() {
  try {
    const products = await fetchAllProducts();
    originalProducts = products;
    applyFiltersAndSort({});
  } catch (error) {
    const grid = document.getElementById("product-grid");
    if (grid) {
      grid.innerHTML = `<div class="error-message"><p>Failed to load products. Please try again later.</p></div>`;
    }
    console.error("API Error:", error);
  }
}

/** Render product grid */
function renderProductGrid(products) {
  const gridContainer = document.getElementById("product-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = products
    .map((product) => {
      const badge = product.tags?.includes("eco")
        ? "Eco"
        : product.tags?.includes("new")
        ? "New"
        : "";
      const rating = product.rating || 4;
      const imageUrl = product.imageUrl
        ? `${STATIC_BASE_URL}${product.imageUrl}`
        : `${STATIC_BASE_URL}/assets/images/fallback.png`;

      return `
        <div class="product-card modern-card" data-category="${
          product.category?.name?.toLowerCase() || "uncategorized"
        }">
          <a href="product-details.html?id=${product.id}" class="product-image-link">
            <div class="image-wrapper">
              <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy"/>
              ${badge ? `<span class="badge">${badge}</span>` : ""}
              <button class="wishlist-btn" data-id="${product.id}">
                <i class="fa${isInWishlist(product.id) ? "s" : "r"} fa-heart"></i>
              </button>
            </div>
          </a>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <div class="rating">${renderStars(rating)}</div>
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
  setupWishlistListeners();
  injectSchemaForProducts(products);
}

/** Render star rating */
function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

/** Wishlist button listeners */
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

/** Setup filter/sort controls */
function setupControls() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCategory = btn.dataset.filter;
      debounceFilter(() => applyFiltersAndSort({ category: selectedCategory }));
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      debounceFilter(() =>
        applyFiltersAndSort({ sort: sortSelect.value })
      );
    });
  }
}

/** Debounce function to prevent rapid re-renders */
function debounceFilter(fn, delay = 200) {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(fn, delay);
}

/** Set active filter button */
function setActiveFilterButton(selectedCategory) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === selectedCategory);
  });
}

/** Apply filters and sorting */
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

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

  renderProductGrid(filtered);
  setActiveFilterButton(category);
}

/** Inject schema.org JSON-LD for rendered products */
function injectSchemaForProducts(products) {
  const head = document.head;

  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    if (el.dataset.schemaType === "product") el.remove();
  });

  products.forEach((product) => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: `${STATIC_BASE_URL}${product.imageUrl}`,
      description: product.description || product.name,
      sku: `SKU-${product.id}`,
      brand: { "@type": "Brand", name: "Bionix Solutions" },
      offers: {
        "@type": "Offer",
        url: `https://www.bionix-hse.co.ke/product-details.html?id=${product.id}`,
        priceCurrency: "KES",
        price: product.price.toFixed(2),
        availability: "https://schema.org/InStock",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.schemaType = "product";
    script.textContent = JSON.stringify(schema, null, 2);
    head.appendChild(script);
  });
}
