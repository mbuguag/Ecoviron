// checkout.js
import { getCartItems, clearCart } from "./cart/cart-service.js";
import { updateMiniCartCount } from "./cart-actions.js";
import { API_BASE_URL, BASE_PATH, formatPrice } from "./apiConfig.js";

// Initialize Checkout
export async function initCheckout() {
  await loadCheckoutSummary();
  await prefillUserInfo();

  document
    .getElementById("checkout-form")
    .addEventListener("submit", submitOrder);
}

/**
 * Load cart summary (products, subtotal, total)
 */
async function loadCheckoutSummary() {
  const cart = await getCartItems();
  const container = document.getElementById("checkout-summary");
  container.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item) => {
    const price = item.price * item.quantity;
    subtotal += price;

    const productDiv = document.createElement("div");
    productDiv.className = "checkout-item flex items-center justify-between py-2 border-b";

    productDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md">
        <span>${item.name} × ${item.quantity}</span>
      </div>
      <span>${formatPrice(price)}</span>
    `;
    container.appendChild(productDiv);
  });

  // Totals
  const totalsDiv = document.createElement("div");
  totalsDiv.className = "checkout-totals mt-4 p-4 bg-gray-50 rounded-md";
  totalsDiv.innerHTML = `
    <div class="flex justify-between"><span>Subtotal:</span><span>${formatPrice(subtotal)}</span></div>
    <div class="flex justify-between"><span>Shipping:</span><span>${formatPrice(0)}</span></div>
    <div class="flex justify-between font-bold text-lg mt-2"><span>Total:</span><span>${formatPrice(subtotal)}</span></div>
  `;
  container.appendChild(totalsDiv);
}

/**
 * Prefill user info if logged in
 */
async function prefillUserInfo() {
  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const user = await res.json();

    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
  } catch (err) {
    console.error("Failed to prefill user info:", err);
  }
}

/**
 * Submit Order
 */
async function submitOrder(e) {
  e.preventDefault();

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = `${BASE_PATH}auth/login.html`;
    return;
  }

  const btn = e.target.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Placing order...";

  const orderData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    paymentMethod: document.querySelector("input[name='payment']:checked")?.value || "cod",
  };

  try {
    const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});


    if (!res.ok) throw new Error("Failed to place order");

    await clearCart();
    await updateMiniCartCount();

    showToast("✅ Order placed successfully!", "success");

    setTimeout(() => {
      window.location.href = `${BASE_PATH}ecommerce/thank-you.html`;
    }, 1500);
  } catch (err) {
    console.error("Order error:", err);
    showToast("❌ Failed to place order. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
}

/**
 * Global Toast Helper
 */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}