import { loadLayoutComponents } from "./domUtils.js";
import { fetchProductById, fetchAllProducts } from "./api.js";
import { addToCart } from "./cart.js";

const productDetailContainer = document.getElementById("product-detail");
const breadcrumb = document.getElementById("breadcrumb");
const relatedContainer = document.getElementById("related-products");
const stickyBar = document.getElementById("mobile-cart-bar");
const loadingSpinner = document.getElementById("loading-spinner");

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadProductDetail();
});

document.getElementById("wishlist-btn").addEventListener("click", ()
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProductDetail() {
  const productId = getProductIdFromURL();
  if (!productId) {
    renderNotFound();
    return;
  }

  showLoading(true);

  try {
    const product = await fetchProductById(productId);
    renderProductDetail(product);
    updateBreadcrumb(product.name);
    await loadRelatedProducts(product);
  } catch (error) {
    console.error("Error loading product:", error);
    renderError();
  } finally {
    showLoading(false);
  }
}

function renderProductDetail(product) {
  const mainImage = product.imageUrl;
  const imageGallery = [product.imageUrl, ...(product.galleryImages || [])];
  const rating = product.rating || 4;

  productDetailContainer.innerHTML = `
    <div class="product-detail-card">
      <div class="gallery-wrapper">
        <img id="main-product-image" src="${mainImage}" alt="${
    product.name
  }" class="product-image main" />
        <div class="thumbnail-row">
          ${imageGallery
            .map(
              (img, i) => `
            <img src="${img}" class="thumbnail ${
                i === 0 ? "active" : ""
              }" alt="thumb-${i}" />
          `
            )
            .join("")}
        </div>
      </div>

      <div class="product-info">
        <h2>${product.name}</h2>
        <p class="product-price">${formatPrice(product.price)}</p>
        <div class="rating">${renderStars(rating)}</div>
        
        <!-- Add the wishlist button here -->
        <button id="wishlist-btn" class="wishlist-icon" title="Add to Wishlist">
          <i class="fa fa-heart"></i>
        </button>
        
        <p>${product.description}</p>
        <button class="btn" id="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

  setupThumbnailEvents();
  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", () => handleAddToCart(product));

  // Add event listener for wishlist button
  document
    .getElementById("wishlist-btn")
    .addEventListener("click", () => toggleWishlist(product));

  // Setup sticky bar
  stickyBar.innerHTML = `
    <span>${product.name}</span>
    <button class="btn" id="mobile-cart-btn">Add to Cart</button>
  `;
  document
    .getElementById("mobile-cart-btn")
    .addEventListener("click", () => handleAddToCart(product));
}

// Add this new function to handle wishlist toggle
function toggleWishlist(product) {
  const wishlistBtn = document.getElementById("wishlist-btn");
  wishlistBtn.classList.toggle("active");

  // Here you would add your actual wishlist logic
  // For example, adding/removing from localStorage or making an API call
  const isActive = wishlistBtn.classList.contains("active");
  showToast(isActive ? "Added to wishlist" : "Removed from wishlist");

  // Example of storing in localStorage:
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (isActive) {
    if (!wishlist.some((item) => item.id === product.id)) {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
      });
    }
  } else {
    wishlist = wishlist.filter((item) => item.id !== product.id);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

async function handleAddToCart(product) {
  try {
    await addToCart(product, 1);
    showToast("Product added to cart!");
  } catch (err) {
    showToast("Failed to add to cart. Please try again.");
  }
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

function renderNotFound() {
  productDetailContainer.innerHTML = `
    <div class="not-found">
      <p>Sorry, the product you're looking for was not found.</p>
      <a href="/frontend/ecommerce/product-grid.html" class="btn">Return to Shop</a>
    </div>
  `;
}

function renderError() {
  productDetailContainer.innerHTML = `
    <div class="error">
      <p>Failed to load product details. Please try again later.</p>
    </div>
  `;
}

function formatPrice(price) {
  return `KES ${parseInt(price).toLocaleString()}`;
}

function setupThumbnailEvents() {
  const thumbnails = document.querySelectorAll(".thumbnail");
  const mainImage = document.getElementById("main-product-image");

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateBreadcrumb(productName) {
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="/">Home</a> &gt; 
      <a href="/frontend/ecommerce/product-grid.html">Shop</a> &gt; 
      <span>${productName}</span>
    `;
  }
}

async function loadRelatedProducts(currentProduct) {
  try {
    const allProducts = await fetchAllProducts();
    const related = allProducts
      .filter(
        (p) =>
          p.id !== currentProduct.id &&
          p.category?.name === currentProduct.category?.name
      )
      .slice(0, 4);

    renderRelatedProducts(related);
  } catch (error) {
    console.warn("Related products fetch failed:", error);
  }
}

function renderRelatedProducts(products) {
  if (!relatedContainer) return;

  relatedContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card">
        <a href="product-details.html?id=${product.id}">
          <img src="${product.imageUrl}" alt="${
        product.name
      }" class="product-image" />
        </a>
        <h4>${product.name}</h4>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    `
    )
    .join("");
}

function showLoading(show) {
  if (loadingSpinner) {
    loadingSpinner.style.display = show ? "flex" : "none";
  }
}
