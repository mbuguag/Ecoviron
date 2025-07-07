import { loadLayoutComponents } from "./domUtils.js";
import { getWishlist, removeFromWishlist } from "./wishlist.js";
import { fetchProductById } from "./api.js";
import { formatPrice } from "./Utils.js";

const grid = document.getElementById("wishlist-grid");
const emptyMsg = document.getElementById("empty-message");

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await renderWishlistItems();
});

async function renderWishlistItems() {
  const ids = getWishlist();

  if (!ids.length) {
    emptyMsg.style.display = "block";
    return;
  }

  const items = await Promise.all(
    ids.map((id) => fetchProductById(id).catch(() => null))
  );

  const validItems = items.filter((item) => item !== null);

  grid.innerHTML = validItems
    .map((product) => {
      return `
        <div class="product-card modern-card">
          <a href="product-details.html?id=${product.id}">
            <div class="image-wrapper">
              <img src="${product.imageUrl}" alt="${
        product.name
      }" class="product-image" />
            </div>
          </a>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <button class="btn add-to-cart" data-id="${
              product.id
            }" data-name="${product.name}" data-price="${
        product.price
      }">Add to Cart</button>
            <button class="wishlist-remove" data-id="${product.id}">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  setupRemoveButtons();
}

function setupRemoveButtons() {
  const removeButtons = document.querySelectorAll(".wishlist-remove");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = parseInt(btn.dataset.id);
      removeFromWishlist(productId);
      renderWishlistItems();
    });
  });
}
