import { API_BASE_URL } from "./apiConfig.js";
import { showToast, showLoader, hideLoader } from "./utils/ui.js";
import { addToCart, isProductInCart } from "./cart-actions.js";
import {
  addToGuestWishlist,
  removeFromGuestWishlist,
  getGuestWishlist,
} from "./wishlist.js";

// Load product detail on page load
document.addEventListener("DOMContentLoaded", loadProductDetail);

async function loadProductDetail() {
  showLoader();
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return renderError("Invalid product ID.");

  try {
    const product = await fetchProductById(productId);
    renderProductDetail(product);
    await renderRelatedProducts(product);
    setupCartLogic(product);
    setupWishlistLogic(product);
    setupGallery(product);
    setupBreadcrumbs(product.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error(error);
    renderError("Product not found or an error occurred.");
  } finally {
    hideLoader();
  }
}

async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

function renderProductDetail(product) {
  const gallery = [
    product.imageUrl || "default.jpg",
    ...(product.galleryImages || []),
  ];

  document.getElementById("product-name").textContent = product.name;
  document.getElementById(
    "product-price"
  ).textContent = `KES ${product.price.toLocaleString()}`;
  document.getElementById("product-desc").textContent = product.description;
  document.getElementById("product-category").textContent =
    product.category?.name || "Uncategorized";
  document.getElementById("product-rating").innerHTML = renderStars(
    product.rating
  );
  document.getElementById(
    "main-product-image"
  ).src = `${API_BASE_URL}/uploads/${gallery[0]}`;
  document.getElementById(
    "main-product-image"
  ).alt = `Image of ${product.name}`;

  const thumbContainer = document.getElementById("thumbnail-gallery");
  thumbContainer.innerHTML = "";
  gallery.forEach((img) => {
    const thumb = document.createElement("img");
    thumb.src = `${API_BASE_URL}/uploads/${img}`;
    thumb.alt = `Thumbnail of ${product.name}`;
    thumb.className = "thumbnail";
    thumb.addEventListener("click", () => {
      document.getElementById(
        "main-product-image"
      ).src = `${API_BASE_URL}/uploads/${img}`;
    });
    thumbContainer.appendChild(thumb);
  });
}

function setupCartLogic(product) {
  const cartBtn = document.getElementById("add-to-cart-btn");
  if (isProductInCart(product.id)) {
    cartBtn.textContent = "In Cart";
    cartBtn.disabled = true;
  }

  cartBtn.addEventListener("click", () => {
    addToCart(product);
    cartBtn.textContent = "In Cart";
    cartBtn.disabled = true;
    showToast("Added to cart!");
  });
}

function setupWishlistLogic(product) {
  const btn = document.getElementById("wishlist-btn");
  const token = localStorage.getItem("jwtToken");

  if (token) {
    // Authenticated logic (placeholder)
    btn.addEventListener("click", () => {
      showToast("Wishlist sync for logged-in users coming soon.");
    });
  } else {
    const guestWishlist = getGuestWishlist();
    const isWished = guestWishlist.includes(product.id);
    updateWishlistIconState(isWished);

    btn.addEventListener("click", () => {
      const current = getGuestWishlist();
      const exists = current.includes(product.id);
      if (exists) {
        removeFromGuestWishlist(product.id);
        updateWishlistIconState(false);
        showToast("Removed from wishlist");
      } else {
        addToGuestWishlist(product.id);
        updateWishlistIconState(true);
        showToast("Added to wishlist");
      }
    });
  }
}

function updateWishlistIconState(isActive) {
  const btn = document.getElementById("wishlist-btn");
  btn.classList.toggle("active", isActive);
  btn.querySelector("i").className = `fa ${
    isActive ? "fa-heart" : "fa-heart-o"
  }`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}

async function renderRelatedProducts(currentProduct) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const products = await res.json();

    const related = products
      .filter(
        (p) =>
          p.id !== currentProduct.id &&
          p.category?.name &&
          currentProduct.category?.name &&
          p.category.name === currentProduct.category.name
      )
      .slice(0, 4);

    const relatedContainer = document.getElementById("related-products");
    relatedContainer.innerHTML = related
      .map(
        (p) => `
      <div class="product-card">
        <a href="product-details.html?id=${p.id}">
          <img src="${API_BASE_URL}/uploads/${p.imageUrl}" alt="${p.name}">
          <h4>${p.name}</h4>
          <p>KES ${p.price.toLocaleString()}</p>
        </a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.warn("Related products failed:", error);
  }
}

function setupGallery(product) {
  const mainImg = document.getElementById("main-product-image");
  const thumbs = document.querySelectorAll(".thumbnail");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
    });
  });
}

function setupBreadcrumbs(productName) {
  const breadcrumb = document.getElementById("breadcrumb-trail");
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="index.html">Home</a> /
      <a href="product-grid.html">Products</a> /
      <span>${productName}</span>
    `;
  }
}

function renderError(message) {
  const container = document.getElementById("product-detail");
  container.innerHTML = `<p class="error-message">${message}</p>`;
}
