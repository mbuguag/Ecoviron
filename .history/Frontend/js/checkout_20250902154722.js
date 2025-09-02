import { layoutLoaded } from "./main.js";
import { fetchAllProducts } from "./api/product-api.js";
import { isLoggedIn } from "./auth.js";
import { CartAPI } from "./cart/cart-api.js";
import { requireAuthForCheckout, updateMiniCartCount, mergeGuestCartToBackend } from "./cart-actions.js";
import { API_BASE_URL, BASE_PATH, formatPrice } from "./apiConfig.js";

const ORDER_SUCCESS_URL = `${BASE_PATH}order-success.html`;

/** Get cart items (guest or logged-in) */
async function getCartItems() {
  if (isLoggedIn()) {
    try {
      const cart = await CartAPI.getCart();
      if (!cart || !Array.isArray(cart.items)) return [];
      return cart.items
        .filter((item) => item.product)
        .map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }));
    } catch (err) {
      console.error("Error fetching cart from backend:", err);
      return [];
    }
  } else {
    return JSON.parse(localStorage.getItem("guest_cart") || "[]");
  }
}

/** Calculate order summary */
async function calculateOrderSummary() {
  const cart = await getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return { ...item, itemTotal };
  });
  return { items, total };
}

/** Render checkout summary */
async function renderCheckoutSummary(summaryContainer, form) {
  const { items, total } = await calculateOrderSummary();
  if (!items.length) {
    summaryContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="${BASE_PATH}products.html" class="btn primary">Continue Shopping</a>
      </div>
    `;
    form.style.display = "none";
    return;
  }

  const html = `
    <h4>Order Items</h4>
    <ul class="checkout-items">
      ${items
        .map(
          (i) =>
            `<li class="checkout-item">
              <span class="item-name">${i.name}</span>
              <span class="item-quantity">${i.quantity} x ${formatPrice(i.price)}</span>
              <span class="item-total">${formatPrice(i.itemTotal)}</span>
            </li>`
        )
        .join("")}
    </ul>
    <div class="order-total">
      <span>Total:</span>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;
  summaryContainer.innerHTML = html;
}

/** Validate checkout form */
function validateForm(data) {
  if (!data.name || !data.email || !data.address || !data.paymentMethod) {
    throw new Error("Please fill in all required fields.");
  }
  if (
    data.paymentMethod === "mpesa" &&
    (!data.mpesaPhone || !/^254[17]\d{8}$/.test(data.mpesaPhone))
  ) {
    throw new Error("Please enter a valid M-Pesa phone number (2547XXXXXXXX).");
  }
  if (!/\S+@\S+\.\S+/.test(data.email)) {
    throw new Error("Please enter a valid email address.");
  }
}

/** Initiate M-Pesa payment */
async function initiateMpesaPayment(phone, amount, orderReference) {
  const token = localStorage.getItem("jwtToken");
  const res = await fetch(`${API_BASE_URL}/payment/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone, amount: String(amount), orderReference }),
  });

  if (!res.ok) {
    let errorMessage = "Failed to initiate M-Pesa payment.";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  showToast("M-Pesa STK push sent. Complete the payment on your phone.");
}

/** Submit checkout order */
async function submitOrder(event, refs) {
  event.preventDefault();

  const { paymentSelect, mpesaPhoneInput } = refs;

  try {
    const cart = await getCartItems();
    if (!cart.length) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) return (window.location.href = `${BASE_PATH}login.html`);

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = paymentSelect.value;
    const mpesaPhone = mpesaPhoneInput?.value.trim() || "";

    validateForm({ name, email, address, paymentMethod, mpesaPhone });

    // Verify product availability
    const products = await fetchAllProducts();
    const validProductIds = new Set(products.map((p) => p.id));
    const invalidItems = cart.filter((i) => !validProductIds.has(i.productId));
    if (invalidItems.length) {
      throw new Error(
        `These items are no longer available: ${invalidItems
          .map((i) => i.name)
          .join(", ")}`
      );
    }

    const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const orderPayload = {
      items: cart.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount,
      customerDetails: { name, email, shippingAddress: address },
      paymentMethod,
    };

    const res = await fetch(`${API_BASE_URL}/orders/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to place order.");
    }

    const { id: orderId, orderReference } = await res.json();
    console.log("✅ Order saved:", orderId, orderReference);

    if (paymentMethod === "mpesa") {
      await initiateMpesaPayment(mpesaPhone, totalAmount, orderReference);
    }

    // Clear backend + guest cart
    await CartAPI.clearCart();
    localStorage.removeItem("guest_cart");
    await updateMiniCartCount();

    window.location.href = `${ORDER_SUCCESS_URL}?ref=${orderReference}`;
  } catch (err) {
    showToast(`Checkout Error: ${err.message}`, true);
    console.error(err);
  }
}

/** Init checkout page */
function initCheckout() {
  const form = document.getElementById("checkout-form");
  const summaryContainer = document.getElementById("checkout-summary");
  const paymentSelect = document.getElementById("payment");
  const mpesaSection = document.getElementById("mpesa-phone-section");
  const mpesaPhoneInput = document.getElementById("mpesa-phone");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!form || !summaryContainer || !paymentSelect || !placeOrderBtn) {
    console.error("Missing checkout form elements.");
    return;
  }

  renderCheckoutSummary(summaryContainer, form);

  placeOrderBtn.addEventListener("click", (e) =>
    submitOrder(e, { paymentSelect, mpesaPhoneInput })
  );

  paymentSelect.addEventListener("change", () => {
    mpesaSection.style.display =
      paymentSelect.value === "mpesa" ? "block" : "none";
  });
}

/** Toast notification */
function showToast(msg, isError = false, duration = 3500) {
  const toast = document.createElement("div");
  toast.className = `toast-message ${isError ? "toast-error" : ""}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/** Toast CSS */
const style = document.createElement("style");
style.textContent = `
.toast-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  z-index: 9999;
  opacity: 0.95;
  font-weight: 500;
}
.toast-message.toast-error {
  background: #f44336;
}
`;
document.head.appendChild(style);

/** Init on DOM ready */
document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;
  requireAuthForCheckout();
  await mergeGuestCartToBackend();
  initCheckout();
});
 