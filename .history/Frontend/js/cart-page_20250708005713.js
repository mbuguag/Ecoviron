import { CartService } from "../modules/cart-service.js";
import { isLoggedIn } from "../auth.js";
import { fetchProductById } from "../api.js";

const IMAGE_BASE_URL = "http://localhost:8080/uploads/";

function buildImageUrl(path) {
  if (!path) return "";
  return IMAGE_BASE_URL + path.replace(/^\/?.*uploads\//, "");
}

document.addEventListener("DOMContentLoaded", loadCartItems);

async function loadCartItems() {
  const container = document.getElementById("cart-container");
  const items = await CartService.getCart();

  const cartItems = await Promise.all(
    items.map(async (item) => {
      if (!item.product && item.productId) {
        const product = await fetchProductById(item.productId);
        return { ...item, product };
      }
      return item;
    })
  );

  if (!cartItems.length) {
    container.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.product.price,
    0
  );

  container.innerHTML = `
    <ul class="cart-items">
      ${cartItems
        .map(
          (item, idx) => `
        <li class="cart-item" data-index="${idx}" data-id="${
            item.product.id
          }" data-qty="${item.quantity}" data-item-id="${item.id || ""}">
          ${
            item.product.imageUrl
              ? `<img src="${buildImageUrl(item.product.imageUrl)}" alt="${
                  item.product.name
                }" class="cart-thumb" />`
              : ""
          }
          <div class="cart-item-info">
            <div class="cart-item-header">
              <a href="product-details.html?id=${item.product.id}">${
            item.product.name
          }</a>
              <button class="remove-btn" title="Remove item">×</button>
            </div>
            <div class="quantity-controls">
              <button class="qty-btn decrease">−</button>
              <span class="quantity">${item.quantity}</span>
              <button class="qty-btn increase">+</button>
            </div>
            <span class="item-total">KES ${(
              item.product.price * item.quantity
            ).toLocaleString()}</span>
          </div>
        </li>`
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
  setupRemoveButtons(cartItems);
}

function setupQuantityButtons(cartItems) {
  const container = document.getElementById("cart-container");
  container.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemEl = btn.closest(".cart-item");
      const index = parseInt(itemEl.dataset.index);
      let quantity = parseInt(itemEl.dataset.qty);
      const product = cartItems[index].product;
      const itemId = itemEl.dataset.itemId;

      quantity = btn.classList.contains("increase")
        ? quantity + 1
        : Math.max(quantity - 1, 1);

      await CartService.update(product.id, quantity, itemId);

      itemEl.dataset.qty = quantity;
      itemEl.querySelector(".quantity").textContent = quantity;
      itemEl.querySelector(".item-total").textContent =
        "KES " + (quantity * product.price).toLocaleString();
      recalculateCartTotal();
    });
  });
}

function setupRemoveButtons(cartItems) {
  const container = document.getElementById("cart-container");
  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemEl = btn.closest(".cart-item");
      const productId = parseInt(itemEl.dataset.id);
      const itemId = itemEl.dataset.itemId;
      const product = cartItems.find(
        (i) => i.product.id === productId
      )?.product;

      if (confirm(`Remove "${product.name}" from cart?`)) {
        await CartService.remove(productId, itemId);
        await loadCartItems();
      }
    });
  });
}

function recalculateCartTotal() {
  const totals = Array.from(document.querySelectorAll(".item-total")).map(
    (el) => {
      const match = el.textContent.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, "")) : 0;
    }
  );
  const total = totals.reduce((sum, val) => sum + val, 0);
  document.querySelector(".cart-summary strong").textContent =
    "Total: KES " + total.toLocaleString();
}
