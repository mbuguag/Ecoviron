import { CartAPI } from "./cart-api.js";
import { getGuestCart } from "./modules/guest-cart.js";
import { fetchAllProducts, fetchProductById } from "./api.js";
import { isLoggedIn } from "./auth.js";

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

    if (!isLoggedIn() && items.length > 0 && !items[0].product) {
      cartItems = await Promise.all(
        items.map(async (item) => {
          const productId = item.productId || item.id;
          if (!productId) return null;
          const product = await fetchProductById(productId);
          return { id: item.id, quantity: item.quantity, product };
        })
      );
      cartItems = cartItems.filter(Boolean);
    } else {
      cartItems = items.map((item) => {
        const product = item.product || {
          id: item.productId,
          name: item.productName,
          imageUrl: item.productImage,
          price: item.price,
        };
        return { ...item, product };
      });
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
            }"
              data-qty="${item.quantity}" data-item-id="${item.id || ""}">
            <img src="${item.product.imageUrl}" alt="${
              item.product.name
            }" class="cart-thumb" />
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
    setupRemoveButtons(cartItems);
  } catch (error) {
    container.innerHTML = `<p>Failed to load cart. Please try again later.</p>`;
    console.error("Cart load error:", error);
  }
}


function setupQuantityButtons(cartItems) {
  const container = document.getElementById("cart-container");

  container.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemEl = btn.closest(".cart-item");
      const index = parseInt(itemEl.dataset.index, 10);
      const itemId = itemEl.dataset.itemId;
      let quantity = parseInt(itemEl.dataset.qty, 10);
      const product = cartItems[index].product;

      if (btn.classList.contains("increase")) {
        quantity += 1;
      } else if (btn.classList.contains("decrease") && quantity > 1) {
        quantity -= 1;
      }

      try {
        if (isLoggedIn()) {
          await CartAPI.updateQuantity(itemId, quantity);
        } else {
          updateGuestQuantity(product.id, quantity);
        }
        itemEl.dataset.qty = quantity;
        itemEl.querySelector(".quantity").textContent = quantity;
        itemEl.querySelector(".item-total").textContent =
          "KES " + (quantity * product.price).toLocaleString();

        recalculateCartTotal();

      } catch (err) {
        console.error("Failed to update quantity:", err);
        alert("Could not update item quantity.");
      }
    });
  });
}

function recalculateCartTotal() {
  const itemTotals = document.querySelectorAll(".item-total");
  let total = 0;

  itemTotals.forEach((el) => {
    const match = el.textContent.match(/[\d,]+/);
    if (match) total += parseInt(match[0].replace(/,/g, ""));
  });

  const totalEl = document.querySelector(".cart-summary strong");
  if (totalEl) {
    totalEl.textContent = "Total: KES " + total.toLocaleString();
  }
}

function setupRemoveButtons(cartItems) {
  const container = document.getElementById("cart-container");

  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemEl = btn.closest(".cart-item");
      const itemId = itemEl.dataset.itemId;
      const productId = parseInt(itemEl.dataset.id, 10);
      const product = cartItems.find(
        (item) => item.product.id === productId
      )?.product;

      const confirmed = confirm(`Remove "${product.name}" from cart?`);
      if (!confirmed) return;

      try {
        if (isLoggedIn()) {
          await CartAPI.removeItem(itemId);
        } else {
          removeGuestCartItem(productId);
        }
        await loadCartItems(); // re-render cart
      } catch (err) {
        console.error("Remove item failed:", err);
        alert("Failed to remove item.");
      }
    });
  });
}

function removeGuestCartItem(productId) {
  let cart = getGuestCart();
  cart = cart.filter(
    (item) => item.productId !== productId && item.id !== productId
  );
  localStorage.setItem("guest_cart", JSON.stringify(cart));
}


function updateGuestQuantity(productId, quantity) {
  const cart = getGuestCart();
  const index = cart.findIndex(
    (item) => item.productId === productId || item.id === productId
  );
  if (index > -1) {
    cart[index].quantity = quantity;
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  }
}

