import { loadLayoutComponents } from "../js/modules/components.js";
import { fetchAllProducts } from "./api.js";
import { addToCart, updateMiniCartCount } from "./cart-actions.js";
import { toggleWishlist, isInWishlist } from "./wishlist.js";
import {}
import { API_BASE_URL, STATIC_BASE_URL, formatPrice } from "./apiConfig.js";

let originalProducts = [];

/* -----------------------------
   Initialization
--------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadAndRenderProducts();
  setupControls();
});

/* -----------------------------
   Load & Render Products
--------------------------------*/
async function loadAndRenderProducts() {
  try {
    const products = await fetchAllProducts(API_BASE_URL);
    originalProducts = products;
    applyFiltersAndSort({});
  } catch (error) {
    const grid = document.getElementById("product-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="error-message">
          <p>⚠️ Failed to load products. Please try again later.</p>
        </div>
      `;
    }
    console.error("API Error:", error);
  }
}

/* -----------------------------
   Render Product Grid
--------------------------------*/
function renderProductGrid(products) {
  const gridContainer = document.getElementById("product-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");

  injectSchema(products);
}

/* -----------------------------
   Create Product Card
--------------------------------*/
function createProductCard(product) {
  const badge = product.tags?.includes("eco")
    ? "Eco"
    : product.tags?.includes("new")
    ? "New"
    : "";

  const rating = product.rating || 4;

  // ✅ Resolve image safely
  const imageUrl = product.imageUrl?.startsWith("http")
    ? product.imageUrl
    : `${STATIC_BASE_URL}${product.imageUrl}`;

  return `
    <div class="product-card modern-card" 
         data-category="${product.category?.name?.toLowerCase() || "uncategorized"}">
      <a href="product-details.html?id=${product.id}" class="product-image-link">
        <div class="image-wrapper">
          <img 
            src="${imageUrl}" 
            alt="${product.name}" 
            class="product-image"
            loading="lazy"
            onerror="this.onerror=null;this.src='/assets/images/OSHA.jpg'"
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
}

/* -----------------------------
   Wishlist (Delegated Events)
--------------------------------*/
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".wishlist-btn");
  if (!btn) return;
  e.preventDefault();

  const productId = parseInt(btn.dataset.id);
  toggleWishlist(productId);

  const icon = btn.querySelector("i");
  icon.classList.toggle("fas");
  icon.classList.toggle("far");
});

/* -----------------------------
   Cart Interactions (Delegated)
--------------------------------*/
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  e.preventDefault();

  const productId = btn.dataset.productId;
  const productName = btn.dataset.productName;
  const productPrice = parseFloat(btn.dataset.productPrice);

  try {
    await addToCart(
      { id: productId, name: productName, price: productPrice },
      1 // default quantity
    );
    updateMiniCartCount();
  } catch (err) {
    console.error("Failed to add to cart:", err);
  }
});

/* -----------------------------
   Render Stars
--------------------------------*/
function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

/* -----------------------------
   Controls (Filter & Sort)
--------------------------------*/
function setupControls() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      applyFiltersAndSort({ category: e.target.dataset.filter });
    }
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFiltersAndSort({ sort: sortSelect.value });
    });
  }
}

/* -----------------------------
   Apply Filters & Sorting
--------------------------------*/
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
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

  renderProductGrid(filtered);
  setActiveFilterButton(category);
}

/* -----------------------------
   Active Filter Button
--------------------------------*/
function setActiveFilterButton(selectedCategory) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === selectedCategory);
  });
}

/* -----------------------------
   JSON-LD Schema
--------------------------------*/
function injectSchema(products) {
  const head = document.head;
  document
    .querySelectorAll('script[data-schema="products"]')
    .forEach((el) => el.remove());

  const schema = products.map((product) => {
    const imageUrl = product.imageUrl?.startsWith("http")
      ? product.imageUrl
      : `${STATIC_BASE_URL}${product.imageUrl}`;

    return {
      "@type": "Product",
      name: product.name,
      image: imageUrl,
      description: product.description || product.name,
      sku: `SKU-${product.id}`,
      brand: { "@type": "Brand", name: "Bionix Solutions" },
      offers: {
        "@type": "Offer",
        url: `product-details.html?id=${product.id}`,
        priceCurrency: "KES",
        price: product.price.toFixed(2),
        availability: "https://schema.org/InStock",
      },
    };
  });

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.schema = "products";
  script.textContent = JSON.stringify(
    { "@context": "https://schema.org", "@graph": schema },
    null,
    2
  );
  head.appendChild(script);
}

/* -----------------------------
   Query Param Helpers
--------------------------------*/
function getCategoryFromQuery() {
  return new URLSearchParams(window.location.search).get("category") || "all";
}
