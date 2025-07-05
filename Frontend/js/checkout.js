import { layoutLoaded } from "./main.js";

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";
const LOGIN_URL = "login.html";

// 🧮 Helpers
const getCartItems = () => JSON.parse(localStorage.getItem("cart") || "[]");

const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

const calculateOrderSummary = () => {
  const cart = getCartItems();
  let total = 0;
  const items = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return {
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      itemTotal,
    };
  });
  return { items, total };
};

// 🧾 Render Order Summary
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

// ✅ Validate
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

// 📲 M-Pesa
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

// 📤 Submit Order
async function submitOrder(event, refs) {
  event.preventDefault();
  console.log("🛒 Form submit triggered");

  const { paymentSelect, mpesaPhoneInput } = refs;

  try {
    const cart = getCartItems();
    if (cart.length === 0) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) return (window.location.href = LOGIN_URL);

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = paymentSelect.value;
    const mpesaPhone = mpesaPhoneInput?.value.trim() || "";

    const orderItems = cart.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

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

    console.log("📦 Payload to send:", orderPayload);

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

    await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("cart");

    window.location.href = `${ORDER_SUCCESS_URL}?ref=${orderReference}`;
  } catch (err) {
    alert(`Checkout Error: ${err.message}`);
    console.error(err);
  }
}

// 🚀 Init
function initCheckout() {
  console.log("✅ initCheckout called");

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

// 🧩 Start
document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;
  initCheckout();
});
