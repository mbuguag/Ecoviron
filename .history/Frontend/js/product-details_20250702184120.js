import { loadLayoutComponents } from "./domUtils.js";
import { fetchProductById, fetchAllProducts } from "./api.js";
import { addToCart } from "./cart.js";

const productDetailContainer = document.getElementById("product-detail");
const relatedContainer = document.getElementById("related-products");

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadProductDetail();
});

function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProductDetail() {
  const productId = getProductIdFromURL();
  if (!productId) return renderNotFound();

  try {
    const product = await fetchProductById(productId);
    renderProductDetail(product);
    loadRelatedProducts(product);
  } catch (error) {
    renderError();
    console.error("Error loading product:", error);
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
        <p>${product.description}</p>
        <button class="btn" id="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", () => handleAddToCart(product));

  setupThumbnailEvents();
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

function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

function formatPrice(price) {
  return `KES ${parseInt(price).toLocaleString()}`;
}

async function handleAddToCart(product) {
  try {
    await addToCart(product, 1);
    showToast("Product added to cart!");
  } catch (error) {
    showToast("Failed to add to cart. Please try again.");
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderNotFound() {
  productDetailContainer.innerHTML = `
    <div class="not-found">
      <p>Sorry, the product you're looking for was not found.</p>
      <a href="product-grid.html" class="btn">Return to Shop</a>
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

async function loadRelatedProducts(currentProduct) {
  if (!relatedContainer) return;

  try {
    const allProducts = await fetchAllProducts();
    const related = allProducts
      .filter(
        (p) =>
          p.id !== currentProduct.id &&
          p.category?.name === currentProduct.category?.name
      )
      .slice(0, 4);

    if (related.length > 0) {
      relatedContainer.innerHTML = `
        <h3>You may also like</h3>
        <div class="related-grid">
          ${related
            .map(
              (product) => `
            <div class="related-card">
              <a href="product-details.html?id=${product.id}">
                <img src="${product.imageUrl}" alt="${product.name}" />
                <h4>${product.name}</h4>
                <p>${formatPrice(product.price)}</p>
              </a>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  } catch (err) {
    console.warn("Related products fetch failed:", err);
  }
}
