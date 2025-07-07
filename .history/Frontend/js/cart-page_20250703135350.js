import { CartAPI } from "./cart-api.js";
import { getGuestCart } from "./modules/guest-cart.js";
import { fetchAllProducts, fetchProductById } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadCartItems();
});

async function loadCartItems() {
  let items = [];

  if (isLoggedIn()) {
    try {
      const cart = await CartAPI.getCart();
      items = cart.items || [];
    } catch (e) {
      console.error("Failed to fetch authenticated cart", e);
    }
  } else {
    items = getGuestCart();
  }

  renderCart(items);
}

async function renderCart(items) {
  const container = document.getElementById("cart-container");

  try {
    let cartItems = items;

    // For guest cart: enrich with product info if needed
    if (!isLoggedIn() && items.length > 0 && !items[0].product) {
      cartItems = await Promise.all(
        items.map(async (item) => {
          const productId = item.productId || item.id;
          if (!productId) return null;
          const product = await fetchProductById(productId);
          return { product, quantity: item.quantity };
        })
      );
      cartItems = cartItems.filter(Boolean);
    }

    if (cartItems.length === 0) {
      container.innerHTML = `<p>Your cart is empty.</p>`;
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    container.innerHTML = `
      <ul class="cart-items">
        ${cartItems
          .map(
            (item, index) => `
          <li class="cart-item" data-index="${index}" data-id="${
              item.product.id
            }" data-qty="${item.quantity}" data-item-id="${item.id || ""}">
            <img src="${item.product.imageUrl}" alt="${
              item.product.name
            }" class="cart-thumb" />
            <div class="cart-item-info">
              <a href="product-details.html?id=${item.product.id}">${
              item.product.name
            }</a>
              <div class="quantity-controls">
                <button class="qty-btn decrease">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="qty-btn increase">+</button>
              </div>
              <span class="item-total">KES ${(
                item.product.price * item.quantity
              ).toLocaleString()}</span>
            </div>
          </li>
        `
          )
          .join("")}
      </ul>
      <div class="cart-summary">
        <strong>Total: KES ${total.toLocaleString()}</strong>
      </div>
      <div class="cart-actions">
        <a href="checkout.html" class="btn btn-primary proceed-checkout">Proceed to Checkout</a>
      </div>
    `;

    setupQuantityButtons(cartItems);
  } catch (error) {
    container.innerHTML = `<p>Failed to load cart. Please try again later.</p>`;
    console.error("Cart load error:", error);
  }
}


function isLoggedIn() {
  const token = localStorage.getItem("jwt");
  return token && token.length > 0;
}
