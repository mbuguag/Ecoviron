import { layoutLoaded } from "./main.js";
import { fetchAllProducts } from "./api/product-api.js";
import { requireAuthForCheckout } from "./cart-actions.js";
import { isLoggedIn } from "./auth.js";
import { CartAPI } from "./cart/cart-api.js";

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";


const getCartItems = async () => {
  if (isLoggedIn()) {
    try {
      const cart = await CartAPI.getCart();
      console.log("Fetched cart from backend:", cart);

      if (!cart || !Array.isArray(cart.items)) return [];

      const validItems = cart.items.filter((item) => item.product);
      console.log("Valid items:", validItems);

      return validItems.map((item) => ({
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
    return JSON.parse(localStorage.getItem("cart") || "[]");
  }
};




const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

const calculateOrderSummary = async () => {
  const cart = await getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return {
      productId: item.productId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      itemTotal,
    };
  });
  return { items, total };
};

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

  let html = `<h4>Order Items</h4><ul class="checkout-items">`;
  for (const item of items) {
    html += `
      <li class="checkout-item">
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">${item.quantity} x ${formatCurrency(
      item.price
    )}</span>
        <span class="item-total">${formatCurrency(item.itemTotal)}</span>
      </li>`;
  }

  html += `</ul>
    <div class="order-total">
      <span>Total:</span>
      <strong>${formatCurrency(total)}</strong>
    </div>`;

  summaryContainer.innerHTML = html;
}


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

async function initiateMpesaPayment(phone, amount, orderReference) {
  console.log("📲 Initiating M-Pesa payment...");
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
   } catch (_) {
     // response is empty or not JSON
   }
   throw new Error(errorMessage);
// checkout.js import { getCartItems, clearCart } from "./cart/cart-service.js"; import { updateMiniCartCount } from "./cart-actions.js"; import { API_BASE_URL, BASE_PATH, formatPrice } from "./apiConfig.js"; // Initialize Checkout export async function initCheckout() { await loadCheckoutSummary(); await prefillUserInfo(); document .getElementById("checkout-form") .addEventListener("submit", submitOrder); } /** * Load cart summary (products, subtotal, total) */ async function loadCheckoutSummary() { const cart = await getCartItems(); const container = document.getElementById("checkout-summary"); container.innerHTML = ""; let subtotal = 0; cart.forEach((item) => { const price = item.price * item.quantity; subtotal += price; const productDiv = document.createElement("div"); productDiv.className = "checkout-item flex items-center justify-between py-2 border-b"; productDiv.innerHTML = <div class="flex items-center gap-3"> <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md"> <span>${item.name} × ${item.quantity}</span> </div> <span>${formatPrice(price)}</span> ; container.appendChild(productDiv); }); // Totals const totalsDiv = document.createElement("div"); totalsDiv.className = "checkout-totals mt-4 p-4 bg-gray-50 rounded-md"; totalsDiv.innerHTML = <div class="flex justify-between"><span>Subtotal:</span><span>${formatPrice(subtotal)}</span></div> <div class="flex justify-between"><span>Shipping:</span><span>${formatPrice(0)}</span></div> <div class="flex justify-between font-bold text-lg mt-2"><span>Total:</span><span>${formatPrice(subtotal)}</span></div> ; container.appendChild(totalsDiv); } /** * Prefill user info if logged in */ async function prefillUserInfo() { const token = localStorage.getItem("jwtToken"); if (!token) return; try { const res = await fetch(${API_BASE_URL}/users/me, { headers: { Authorization: Bearer ${token} }, }); if (!res.ok) return; const user = await res.json(); document.getElementById("name").value = user.name || ""; document.getElementById("email").value = user.email || ""; } catch (err) { console.error("Failed to prefill user info:", err); } } /** * Submit Order */ async function submitOrder(e) { e.preventDefault(); const token = localStorage.getItem("jwtToken"); if (!token) { sessionStorage.setItem("redirectAfterLogin", window.location.pathname); window.location.href = ${BASE_PATH}auth/login.html; return; } const btn = e.target.querySelector("button[type='submit']"); btn.disabled = true; btn.textContent = "Placing order..."; const orderData = { name: document.getElementById("name").value, email: document.getElementById("email").value, address: document.getElementById("address").value, paymentMethod: document.querySelector("input[name='payment']:checked")?.value || "cod", }; try { const res = await fetch(${API_BASE_URL}/orders/checkout, { method: "POST", headers: { "Content-Type": "application/json", Authorization: Bearer ${token}, }, body: JSON.stringify(orderData), }); if (!res.ok) throw new Error("Failed to place order"); await clearCart(); await updateMiniCartCount(); showToast("✅ Order placed successfully!", "success"); setTimeout(() => { window.location.href = ${BASE_PATH}ecommerce/thank-you.html; }, 1500); } catch (err) { console.error("Order error:", err); showToast("❌ Failed to place order. Please try again.", "error"); } finally { btn.disabled = false; btn.textContent = "Place Order"; } } /** * Global Toast Helper */ function showToast(message, type = "success") { const toast = document.createElement("div"); toast.className = toast toast-${type}; toast.textContent = message; document.body.appendChild(toast); requestAnimationFrame(() => toast.classList.add("visible")); setTimeout(() => { toast.classList.remove("visible"); setTimeout(() => toast.remove(), 300); }, 3000); }
  }

  alert("M-Pesa STK push sent. Complete the payment on your phone.");
}

async function submitOrder(event, refs) {
  event.preventDefault();

  const { paymentSelect, mpesaPhoneInput } = refs;

  try {
    const cart =  await getCartItems();
    if (cart.length === 0) throw new Error("Your cart is empty.");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = paymentSelect.value;
    const mpesaPhone = mpesaPhoneInput?.value.trim() || "";

    const orderItems = cart.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const products = await fetchAllProducts();
    const validProductIds = new Set(products.map((p) => p.id));
    const invalidItems = orderItems.filter(
      (item) => !validProductIds.has(item.productId)
    );

    if (invalidItems.length > 0) {
      const missingNames = invalidItems.map((i) => i.name).join(", ");
      throw new Error(
        `The following items are no longer available: ${missingNames}`
      );
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
    console.log(" Order saved:", orderId, orderReference);

    if (paymentMethod === "mpesa") {
      await initiateMpesaPayment(mpesaPhone, totalAmount, orderReference);
    }

    // Clear both guest and backend cart
    await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("guest_cart");

    window.location.href = `${ORDER_SUCCESS_URL}?ref=${orderReference}`;
  } catch (err) {
    alert(`Checkout Error: ${err.message}`);
    console.error(err);
  }
}

function initCheckout() {
  const form = document.getElementById("checkout-form");
  const summaryContainer = document.getElementById("checkout-summary");
  const paymentSelect = document.getElementById("payment");
  const mpesaSection = document.getElementById("mpesa-phone-section");
  const mpesaPhoneInput = document.getElementById("mpesa-phone");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!form || !summaryContainer || !paymentSelect || !placeOrderBtn) {
    console.error("Missing required checkout form elements.");
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

// Init on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;
  requireAuthForCheckout();
  initCheckout();
});
