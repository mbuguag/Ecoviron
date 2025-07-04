import { loadLayoutComponents } from "./domUtils.js";

const wishlistGrid = document.getElementById("wishlist-grid");
const emptyMessage = document.getElementById("empty-message");
const token = localStorage.getItem("jwtToken");
const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  loadWishlist();
});

async function loadWishlist() {
  if (token) {
    await loadWishlistFromBackend();
  } else {
    loadWishlistFromLocalStorage();
  }
}

async function loadWishlistFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch wishlist");

    const items = await res.json();
    if (items.length === 0) return showEmptyMessage();

    renderWishlistItems(items);
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    showEmptyMessage();
  }
}

function loadWishlistFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (items.length === 0) {
    return showEmptyMessage();
  }
  renderWishlistItems(items);
}

function renderWishlistItems(items) {
  wishlistGrid.innerHTML = items
    .map((item) => {
      const id = item.productId || item.id;
      const imageUrl = item.imageUrl?.startsWith("http")
        ? item.imageUrl
        : `http://localhost:8080${item.imageUrl}`;

      return `
      <div class="product-card">
        <a href="product-details.html?id=${id}">
          <img src="${imageUrl}" alt="${item.name}" class="product-image" />
        </a>
        <h4>${item.name}</h4>
        <p class="product-price">KES ${parseInt(
          item.price
        ).toLocaleString()}</p>
        <div class="wishlist-actions">
          <button class="btn btn-remove" data-id="${id}">Remove</button>
          <button class="btn btn-secondary btn-move" data-id="${id}" 
                  data-name="${item.name}" data-price="${item.price}">
            Move to Cart
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  attachRemoveListeners();
  attachMoveToCartListeners();
}


function attachRemoveListeners() {
  const buttons = document.querySelectorAll(".btn-remove");
  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      if (token) {
        await removeFromBackendWishlist(productId);
      } else {
        removeFromLocalStorageWishlist(productId);
      }
      loadWishlist(); // refresh view
    })
  );
}

function attachMoveToCartListeners() {
  const buttons = document.querySelectorAll(".btn-move");

  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const name = btn.dataset.name;
      const price = btn.dataset.price;

      // Move to cart (local or backend)
      const productObj = {
        id: parseInt(productId),
        name,
        price: parseFloat(price),
      };

      if (token) {
        await addToBackendCart(productId);
        await removeFromBackendWishlist(productId);
      } else {
        addToGuestCart(productObj);
        removeFromLocalStorageWishlist(productId);
      }

      showToast("Moved to cart!");
      loadWishlist();
    })
  );
}
function addToGuestCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

async function addToBackendCart(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (!res.ok) throw new Error("Cart add failed");
  } catch (err) {
    console.error("Error moving to cart:", err);
  }
}

async function removeFromBackendWishlist(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to remove item from backend wishlist");
  } catch (err) {
    console.error("Error removing wishlist item:", err);
  }
}

function removeFromLocalStorageWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((item) => item.id != productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function showEmptyMessage() {
  wishlistGrid.innerHTML = "";
  emptyMessage.style.display = "block";
}
