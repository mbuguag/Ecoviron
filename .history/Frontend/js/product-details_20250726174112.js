import { loadLayoutComponents } from "../js/modules/components.js";
import { fetchProductById, fetchAllProducts } from "./api.js";
import { addToCart } from "./cart-actions.js";
import {
  _BASE_URL,
  getAssetPath,
  getQueryParam,
  formatPrice,
  loadComponent,
} from "./apiConfig.js";



document.addEventListener("DOMContentLoaded", () => {
  loadProductDetail();
});

// Get product ID from URL
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProductDetail() {
  const productId = getProductIdFromURL();
  if (!productId) {
    renderError("No product ID found in the URL.");
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error("Product not found");
    const product = await response.json();
    renderProductDetail(product);
    loadRelatedProducts(product.category.id, product.id);
  } catch (err) {
    console.error("Error loading product:", err);
    renderError("Unable to load product details.");
  } finally {
    showLoading(false);
  }
}

function renderProductDetail(product) {
  // Text
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-description").textContent =
    product.description;
  document.getElementById("product-category").textContent =
    product.category.name;
  document.getElementById(
    "product-price"
  ).textContent = `KES ${product.price.toLocaleString()}`;
  document.getElementById("product-rating").textContent = getStars(
    product.rating || 4
  );

  // Main Image
 const mainImage = document.getElementById("main-product-image");
 mainImage.src = `${API_BASE_URL}${product.imageUrl}`;
 mainImage.alt = product.name;


  // Gallery
  const thumbnailsContainer = document.getElementById("gallery-thumbnails");
  thumbnailsContainer.innerHTML = "";
  const images = [product.imageUrl, ...(product.galleryImages || [])];

  images.forEach((img, index) => {
    if (!img) return; // Skip empty images
    const thumb = document.createElement("img");
    thumb.src = `${API_BASE_URL}${img}`;
    thumb.className = "thumbnail";
    thumb.alt = `Image ${index + 1}`;
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
    });
    thumbnailsContainer.appendChild(thumb);
  });


  // Eco Features
  const ecoFeatures = document.getElementById("eco-features");
  ecoFeatures.innerHTML = "";
  if (product.ecoFriendly) {
    ecoFeatures.innerHTML += `<li><i class="fa fa-leaf"></i> Eco-Friendly</li>`;
  }
  if (product.recyclable) {
    ecoFeatures.innerHTML += `<li><i class="fa fa-recycle"></i> Recyclable</li>`;
  }

  // Wishlist
  document.getElementById("wishlist-btn").addEventListener("click", () => {
    alert("Added to wishlist (placeholder)");
  });

  // Cart Button
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    addToCart(product);
    updateStickyBar(product); // mobile sticky update
  });

  // Sticky Mobile
  const stickyPrice = document.getElementById("sticky-price");
  stickyPrice.textContent = `KES ${product.price.toLocaleString()}`;
  document
    .getElementById("sticky-add-to-cart")
    .addEventListener("click", () => {
      addToCart(product);
    });

  // Show sticky bar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById("mobile-sticky-bar").style.display = "flex";
  }
}

function getStars(rating) {
  const full = "★".repeat(Math.floor(rating));
  const empty = "☆".repeat(5 - Math.floor(rating));
  return full + empty;
}

function renderError(message) {
  const container = document.querySelector(".product-detail-modern");
  container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

function showLoading(isLoading) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = isLoading ? "flex" : "none";
  }
}

// Load related products from same category
async function loadRelatedProducts(categoryId, excludeProductId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/products/category/${categoryId}`
    );
    if (!res.ok) return;

    const products = await res.json();
    const related = products.filter((p) => p.id !== parseInt(excludeProductId));
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
      <img src="${API_BASE_URL}/uploads/${product.mainImage}" alt="${
      product.name
    }" />
      <h4>${product.name}</h4>
      <span class="price">KES ${product.price.toLocaleString()}</span>
      <a href="product-details.html?id=${
        product.id
      }" class="btn btn-sm">View</a>
    `;
    container.appendChild(card);
  });
}
