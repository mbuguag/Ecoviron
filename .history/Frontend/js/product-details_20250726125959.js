import { loadLayoutComponents } from "../js/modules/components.js";
import { fetchProductById, fetchAllProducts } from "./api.js";
import { addToCart } from "./cart-actions.js";
import { getQueryParam } from "./modules/Utils.js";

const API_BASE = "http://localhost:8080";
const productDetailContainer = document.getElementById("product-detail");
const breadcrumb = document.getElementById("breadcrumb");
const relatedContainer = document.getElementById("related-products");
const stickyBar = document.getElementById("mobile-cart-bar");
const loadingSpinner = document.getElementById("loading-spinner");

let currentProduct = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await loadProductDetail();
});

async function loadProductDetail() {
  const productId = getQueryParam("id");
  if (!productId) return renderNotFound();

  showLoading(true);

  try {
    const product = await fetchProductById(productId);
    currentProduct = product;

    renderProductDetail(product);
    updateBreadcrumb(product.name);
    await loadRelatedProducts(product);
  } catch (err) {
    console.error("Error loading product:", err);
    renderError();
  } finally {
    showLoading(false);
  }
}

function renderProductDetail(product) {
  const gallery = [product.imageUrl, ...(product.galleryImages || [])].map(
    (img) => (img.startsWith("http") ? img : `${API_BASE}/${img}`)
  );

  const rating = product.rating || 4;

  productDetailContainer.innerHTML = `
    <div class="product-detail-card">
      <div class="gallery-wrapper">
        <img id="main-product-image" src="${gallery[0]}" alt="${
    product.name
  }" class="product-image main" />
        <div class="thumbnail-row">
          ${gallery
            .map(
              (img, i) =>
                `<img src="${img}" class="thumbnail ${
                  i === 0 ? "active" : ""
                }" alt="thumb-${i}" />`
            )
            .join("")}
        </div>
      </div>

      <div class="product-info">
        <h2>${product.name}</h2>
        <p class="product-price">${formatPrice(product.price)}</p>
        <div class="rating">${renderStars(rating)}</div>
        <button id="wishlist-btn" class="wishlist-icon" title="Add to Wishlist">
          <i class="fa fa-heart"></i>
        </button>
        <p>${product.description}</p>
        <button class="btn" id="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

  setupThumbnailEvents();
  setupStickyBar(product);

  document
    .getElementById("add-to-cart-btn")
    ?.addEventListener("click", () => handleAddToCart(product));
  document
    .getElementById("wishlist-btn")
    ?.addEventListener("click", () => handleWishlistToggle(product));
}

function setupStickyBar(product) {
  if (!stickyBar) return;

  stickyBar.innerHTML = `
    <span>${product.name}</span>
    <button class="btn" id="mobile-cart-btn">Add to Cart</button>
  `;

  document
    .getElementById("mobile-cart-btn")
    ?.addEventListener("click", () => handleAddToCart(product));
}

async function handleWishlistToggle(product) {
  const token = localStorage.getItem("jwtToken");
  const btn = document.getElementById("wishlist-btn");
  const isActive = btn.classList.toggle("active");

  if (!token) return toggleGuestWishlist(product, isActive);

  try {
    const url = `${API_BASE}/wishlist/${isActive ? "add" : "remove"}/$${
      product.id
    }`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Wishlist operation failed");

    showToast(isActive ? "Added to wishlist" : "Removed from wishlist");
  } catch (err) {
    console.error(err);
    showToast("Error syncing wishlist");
  }
}

function toggleGuestWishlist(product, isActive) {
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
  showToast(isActive ? "Saved to wishlist (guest)" : "Removed from wishlist");
}

async function handleAddToCart(product) {
  try {
    await addToCart(product, 1);
    showToast("Product added to cart!");
  } catch (err) {
    console.error(err);
    showToast("Failed to add to cart.");
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
  } catch (err) {
    console.warn("Failed to load related products:", err);
  }
}

function renderRelatedProducts(products) {
  if (!relatedContainer) return;

  relatedContainer.innerHTML = products
    .map(
      (p) => `
      <div class="product-card">
        <a href="product-details.html?id=${p.id}">
          <img src="${
            p.imageUrl.startsWith("http")
              ? p.imageUrl
              : `${API_BASE}/${p.imageUrl}`
          }" alt="${p.name}" class="product-image" />
        </a>
        <h4>${p.name}</h4>
        <p class="product-price">${formatPrice(p.price)}</p>
      </div>
    `
    )
    .join("");
}

function setupThumbnailEvents() {
  const thumbs = document.querySelectorAll(".thumbnail");
  const mainImage = document.getElementById("main-product-image");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });
}

function updateBreadcrumb(name) {
  if (!breadcrumb) return;

  breadcrumb.innerHTML = `
    <a href="/">Home</a> &gt;
    <a href="/frontend/ecommerce/product-grid.html">Shop</a> &gt;
    <span>${name}</span>
  `;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
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

function showLoading(show) {
  if (loadingSpinner) {
    loadingSpinner.style.display = show ? "flex" : "none";
  }
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
