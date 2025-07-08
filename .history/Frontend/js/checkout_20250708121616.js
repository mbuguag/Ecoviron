import { layoutLoaded } from "./main.js";
import { fetchAllProducts } from "./api/product-api.js";
import { requireAuthForCheckout } from "./cart-actions.js";

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";

const getCartItems = () =>
  JSON.parse(localStorage.getItem("guest_cart") || "[]");

const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

const calculateOrderSummary = () => {
  const cart = getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return {
      productId: item.id || item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      itemTotal,
    };
  });
  return { items, total };
};

function renderCheckoutSummary(summaryContainer, form) {
  const { items, total } = calculateOrderSummary();

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

async function initiateMpesaPayment(phone, amount, orderId) {
  console.log("📲 Initiating M-Pesa payment...");
  const res = await fetch(`${API_BASE_URL}/payment/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount: String(amount), orderId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to initiate M-Pesa payment.");
  }

  alert("M-Pesa STK push sent. Complete the payment on your phone.");
}

async function submitOrder(event, refs) {
  event.preventDefault();

  const { paymentSelect, mpesaPhoneInput } = refs;

  try {
    const cart = getCartItems();
    if (cart.length === 0) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) return (window.location.href = "login.html");

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
    console.log("✅ Order saved:", orderId, orderReference);

    if (paymentMethod === "mpesa") {
      await initiateMpesaPayment(mpesaPhone, totalAmount, orderId);
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
    console.error("❌ Missing required checkout form elements.");
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
