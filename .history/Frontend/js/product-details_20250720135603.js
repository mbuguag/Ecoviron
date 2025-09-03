import { layoutLoaded } from "./main.js";
import { getLoggedInUser } from "./auth.js";
import { addToCart } from "./cart-actions.js";
import {
  toggleWishlistIcon,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.js";

const API_BASE_URL = "http://localhost:8080/api";
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Utility to build safe image URLs
function buildImageUrl(path) {
  return path.startsWith("http")
    ? path
    : `http://localhost:8080/${path.replace(/^\/+/, "")}`;
}

// Fetch and render product
async function fetchProductDetails() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product details.");
    const product = await response.json();
    renderProductDetail(product);
    fetchRelatedProducts(product.categoryId, product.id);
  } catch (error) {
    console.error("Error loading product:", error);
  }
}

function renderProductDetail(product) {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const gallery = [product.imageUrl, ...(product.galleryImages || [])].map(
    buildImageUrl
  );

  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="image-gallery">
        <img id="main-product-image" src="${gallery[0]}" alt="${
    product.name
  }" class="main-image" />
        <div class="thumbnail-container">
          ${gallery
            .map(
              (img, idx) => `
              <img src="${img}" class="thumbnail ${
                idx === 0 ? "active" : ""
              }" data-index="${idx}" />
            `
            )
            .join("")}
        </div>
      </div>
      <div class="product-info">
        <h1 class="product-title">${product.name}</h1>
        <p class="product-description">${product.description}</p>
        <p class="product-price">KES ${product.price}</p>
        
        <button id="add-to-cart" class="btn btn-primary">Add to Cart</button>
        
        <button id="wishlist-btn" class="wishlist-btn">
          <i class="wishlist-icon ${
            isInWishlist(product.id) ? "fas" : "far"
          } fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  // Event: Add to Cart
  document.getElementById("add-to-cart").addEventListener("click", () => {
    addToCart(product);
  });

  // Event: Wishlist toggle
  const wishlistBtn = document.getElementById("wishlist-btn");
  wishlistBtn.addEventListener("click", async () => {
    const icon = wishlistBtn.querySelector(".wishlist-icon");
    const inWishlist = isInWishlist(product.id);

    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }

    toggleWishlistIcon(icon, !inWishlist);
  });

  // Thumbnail click functionality
  const thumbnails = container.querySelectorAll(".thumbnail");
  const mainImage = container.querySelector("#main-product-image");
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });
}

// Related Products
async function fetchRelatedProducts(categoryId, excludeProductId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/category/${categoryId}`
    );
    if (!response.ok) throw new Error("Failed to fetch related products.");
    const products = await response.json();
    const filtered = products.filter(
      (p) => p.id !== parseInt(excludeProductId)
    );
    renderRelatedProducts(filtered.slice(0, 4)); // Show only 4
  } catch (error) {
    console.error("Error loading related products:", error);
  }
}

function renderRelatedProducts(products) {
  const container = document.getElementById("related-products");
  if (!container) return;

  container.innerHTML = `
    <h3>You may also like</h3>
    <div class="related-grid">
      ${products
        .map(
          (p) => `
        <div class="related-product-card">
          <img src="${buildImageUrl(p.imageUrl)}" alt="${
            p.name
          }" class="product-image" />
          <h4>${p.name}</h4>
          <p>KES ${p.price}</p>
          <a href="product-details.html?id=${
            p.id
          }" class="btn btn-outline">View</a>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  layoutLoaded().then(() => {
    fetchProductDetails();
  });
});
