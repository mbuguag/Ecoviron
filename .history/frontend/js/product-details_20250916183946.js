import { loadLayoutComponents } from "../js/modules/components.js";
import { fetchProductById, fetchAllProducts } from "./api.js";
import { addToCart } from "./cart-actions.js";
import { showToast } from "./utils/toast.js";
import {
  STATIC_BASE_URL,
  getQueryParam,
  formatPrice,
} from "./apiConfig.js";

/* -----------------------------
   Helpers
--------------------------------*/
function resolveImageUrl(url) {
  if (!url) return "/assets/images/OSHA.jpg";
  return url.startsWith("http") ? url : `${STATIC_BASE_URL}${url}`;
}

function getStars(rating) {
  const full = "★".repeat(Math.floor(rating));
  const empty = "☆".repeat(5 - Math.floor(rating));
  return full + empty;
}

/* -----------------------------
   Initialization
--------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  loadProductDetail();
});

/* -----------------------------
   Load Product Detail
--------------------------------*/
function getProductIdFromURL() {
  return getQueryParam("id");
}

async function loadProductDetail() {
  const productId = getProductIdFromURL();
  if (!productId) {
    renderError("No product ID found in the URL.");
    return;
  }

  try {
    showLoading(true);
    const product = await fetchProductById(productId);
    renderProductDetail(product);
    loadRelatedProducts(product.category.id, product.id);
  } catch (err) {
    console.error("Error loading product:", err);
    renderError("Unable to load product details.");
  } finally {
    showLoading(false);
  }
}

/* -----------------------------
   Render Product Detail
--------------------------------*/
function renderProductDetail(product) {
  renderBreadcrumb(product);

  // Textual Info
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-description").textContent =
    product.description || "";
  document.getElementById("product-category").textContent =
    product.category?.name || "Uncategorized";
  document.getElementById("product-price").textContent = formatPrice(
    product.price
  );
  document.getElementById("product-rating").textContent = getStars(
    product.rating || 4
  );

  // Main Image
  const mainImage = document.getElementById("main-product-image");
  mainImage.src = resolveImageUrl(product.imageUrl);
  mainImage.alt = product.name;
  mainImage.onerror = () => {
    mainImage.src = "/assets/images/fallback.jpg";
  };

  // Gallery Thumbnails
  const thumbnailsContainer = document.getElementById("gallery-thumbnails");
  thumbnailsContainer.innerHTML = "";
  const images = [product.imageUrl, ...(product.galleryImages || [])];

  images.forEach((img, index) => {
    if (!img) return;
    const thumb = document.createElement("img");
    thumb.src = resolveImageUrl(img);
    thumb.className = "thumbnail";
    thumb.alt = `Image ${index + 1}`;
    thumb.loading = "lazy";
    thumb.onerror = () => {
      thumb.src = "/assets/images/fallback.jpg";
    };
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
    });
    thumbnailsContainer.appendChild(thumb);
  });

  // Eco Features
  const ecoFeatures = document.getElementById("eco-features");
  ecoFeatures.innerHTML = "";
  if (product.ecoFriendly)
    ecoFeatures.innerHTML += `<li><i class="fa fa-leaf"></i> Eco-Friendly</li>`;
  if (product.recyclable)
    ecoFeatures.innerHTML += `<li><i class="fa fa-recycle"></i> Recyclable</li>`;

  // Wishlist (placeholder)
  document
    .getElementById("wishlist-btn")
    .addEventListener("click", () => {
      alert("Added to wishlist (placeholder)");
    });

  // Add to Cart
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    addToCart(product);
    updateStickyBar(product);
  });

  // Sticky Cart (Mobile)
  document.getElementById("sticky-price").textContent = formatPrice(
    product.price
  );
  document
    .getElementById("sticky-add-to-cart")
    .addEventListener("click", () => {
      addToCart(product);
    });

  if (window.innerWidth <= 768) {
    document.getElementById("mobile-sticky-bar").style.display = "flex";
  }
}

/* -----------------------------
   Related Products
--------------------------------*/
async function loadRelatedProducts(categoryId, excludeProductId) {
  try {
    const allProducts = await fetchAllProducts();
    const related = allProducts.filter(
      (p) => p.category.id === categoryId && p.id !== parseInt(excludeProductId)
    );
    renderRelatedProducts(related);
  } catch (err) {
    console.warn("Failed to load related products:", err);
  }
}

function renderRelatedProducts(products) {
  const container = document.getElementById("related-products");
  if (!container) return;

  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p>No related products found.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "related-card";
    card.innerHTML = `
      <img 
        src="${resolveImageUrl(product.imageUrl)}" 
        alt="${product.name}" 
        onerror="this.onerror=null;this.src='/assets/images/fallback.jpg'"
      />
      <h4>${product.name}</h4>
      <span class="price">${formatPrice(product.price)}</span>
      <a href="product-details.html?id=${product.id}" class="btn btn-sm">View</a>
    `;
    container.appendChild(card);
  });
}

/* -----------------------------
   Breadcrumb
--------------------------------*/
function renderBreadcrumb(product) {
  const breadcrumb = document.getElementById("breadcrumb");
  if (!breadcrumb || !product) return;

  const homeLink = `<a href="../index.html">Home</a>`;
  const categoryLink = `<a href="product-grid.html?category=${product.category.id}">${product.category.name}</a>`;
  const current = `<span class="current">${product.name}</span>`;

  breadcrumb.innerHTML = `${homeLink} / ${categoryLink} / ${current}`;
}

/* -----------------------------
   Error + Loading States
--------------------------------*/
function renderError(message) {
  const container = document.querySelector(".product-detail-modern");
  container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

function showLoading(isLoading) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.style.display = isLoading ? "flex" : "none";
}
