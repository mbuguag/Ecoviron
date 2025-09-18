// ====================
// Checkout Script
// ====================

import { layoutLoaded } from "./main.js";
import { fetchAllProducts } from "./api/product-api.js";
import { requireAuthForCheckout } from "./cart-actions.js";
import { isLoggedIn } from "./auth.js";
import { CartAPI } from "./cart/cart-api.js";
import { API_BASE_URL, BASE_PATH, formatPrice } from "./apiConfig.js"; 

// Redirect URL
const ORDER_SUCCESS_URL = `${BASE_PATH}order-success.html`;

// --- Cart Helpers ---
const getCartItems = async () => {
  if (isLoggedIn()) {
    try {
      const cart = await CartAPI.getCart();

      if (!cart || !Array.isArray(cart.items)) return [];

      return cart.items
        .filter((item) => item.product) // discard invalid items
        .map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }));
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      return [];
    }
  } else {
    return JSON.parse(localStorage.getItem("guest_cart") || "[]");
  }
};

const calculateOrderSummary = async () => {
  const cart = await getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return { ...item, itemTotal };
  });
  return { items, total };
};

// --- Render Checkout Summary ---
async function renderCheckoutSummary(summaryContainer, form) {
  const { items, total } = await calculateOrderSummary();

  if (items.length === 0) {
    summaryContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="products.html" class="btn primary">Continue Shopping</a>
      </div>
    `;
    form.style.display = "none";
    return;
  }

  summaryContainer.innerHTML = `
    <h4>Order Items</h4>
    <ul class="checkout-items">
      ${items
        .map(
          (item) => `
        <li class="checkout-item">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">${item.quantity} × ${formatPrice(item.price)}</span>
          <span class="item-total">${formatPrice(item.itemTotal)}</span>
        </li>`
        )
        .join("")}
    </ul>
    <div class="order-total">
      <span>Total:</span>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;
}

// --- Validation ---
function validateForm(data) {
  if (!data.name || !data.email || !data.address || !data.paymentMethod) {
    throw new Error("Please fill in all required fields.");
  }

  if (
    data.paymentMethod === "mpesa" &&
    (!data.mpesaPhone || !/^254[17]\d{8}$/.test(data.mpesaPhone))
  ) {
    throw new Error("Enter a valid M-Pesa number (format: 2547XXXXXXXX).");
  }

  if (!/\S+@\S+\.\S+/.test(data.email)) {
    throw new Error("Enter a valid email address.");
  }
}

// --- Payment ---
async function initiateMpesaPayment(phone, amount, orderReference) {
  try {
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

    alert("✅ M-Pesa STK push sent. Complete payment on your phone.");
  } catch (err) {
    console.error("M-Pesa Error:", err);
    alert(err.message);
    throw err;
  }
}

// --- Order Submission ---
async function submitOrder(event, refs) {
  event.preventDefault();
  const { paymentSelect, mpesaPhoneInput } = refs;

  try {
    const cart = await getCartItems();
    if (cart.length === 0) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) return (window.location.href = "login.html");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = paymentSelect.value;
    const mpesaPhone = mpesaPhoneInput?.value.trim() || "";

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Validate items exist
    const products = await fetchAllProducts();
    const validProductIds = new Set(products.map((p) => p.id));
    const invalidItems = orderItems.filter((i) => !validProductIds.has(i.productId));
    if (invalidItems.length > 0) {
      throw new Error(
        `Unavailable items: ${invalidItems.map((i) => i.name).join(", ")}`
      );
    }

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    validateForm({ name, email, address, paymentMethod, mpesaPhone });

    const orderPayload = {
      items: orderItems,
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

    // Clear cart (both guest & backend)
    await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("guest_cart");

    window.location.href = `${ORDER_SUCCESS_URL}?ref=${orderReference}`;
  } catch (err) {
    alert(`❌ Checkout Error: ${err.message}`);
    console.error(err);
  }
}

// --- Init Checkout ---
function initCheckout() {
  const form = document.getElementById("checkout-form");
  const summaryContainer = document.getElementById("checkout-summary");
  const paymentSelect = document.getElementById("payment");
  const mpesaSection = document.getElementById("mpesa-phone-section");
  const mpesaPhoneInput = document.getElementById("mpesa-phone");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!form || !summaryContainer || !paymentSelect || !placeOrderBtn) {
    console.error("❌ Missing checkout elements.");
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

// --- Bootstrap ---
document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;
  requireAuthForCheckout();
  initCheckout();
});
