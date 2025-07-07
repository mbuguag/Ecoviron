
console.log("🔃 checkout.js script started");

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";
const LOGIN_URL = "login.html";


let elements; // declared globally

// Utility Functions
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

const renderCheckoutSummary = () => {
  const { items, total } = calculateOrderSummary();

  if (items.length === 0) {
    elements.summaryContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="products.html" class="btn primary">Continue Shopping</a>
      </div>
    `;
    elements.form.style.display = "none";
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

  elements.summaryContainer.innerHTML = html;
};

function validateForm(data) {
  if (!data.name || !data.email || !data.address || !data.paymentMethod) {
    throw new Error("Please fill in all required fields.");
  }

  if (data.paymentMethod === "mpesa") {
    if (!data.mpesaPhone || !/^254[17]\d{8}$/.test(data.mpesaPhone)) {
      throw new Error(
        "Please enter a valid M-Pesa phone number (2547XXXXXXXX)."
      );
    }
  }

  if (!/\S+@\S+\.\S+/.test(data.email)) {
    throw new Error("Please enter a valid email address.");
  }
}

async function initiateMpesaPayment(phone, amount, orderId) {
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

// Order Submission
async function submitOrder(event) {
  event.preventDefault();
  console.log("Submit triggered ✅");

  try {
    const cart = getCartItems();
    if (cart.length === 0) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) return (window.location.href = LOGIN_URL);

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = elements.paymentSelect.value;
    const mpesaPhone = elements.mpesaPhoneInput?.value.trim() || "";

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

    // 🔍 Log the outgoing order payload
console.log("📦 Submitting order with payload:", orderPayload);

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


function initCheckout() {
  
  renderCheckoutSummary();

  if (!elements.form) {
    console.error(" Form not found. Aborting checkout initialization.");
    return;
  }

  elements.form.addEventListener("submit", submitOrder);
  console.log(" submit handler attached");
  elements.paymentSelect.addEventListener("change", () => {
    elements.mpesaSection.style.display =
      elements.paymentSelect.value === "mpesa" ? "block" : "none";
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  elements = {
    form: document.getElementById("checkout-form"),
    summaryContainer: document.getElementById("checkout-summary"),
    paymentSelect: document.getElementById("payment"),
    mpesaSection: document.getElementById("mpesa-phone-section"),
    mpesaPhoneInput: document.getElementById("mpesa-phone"),
  };

  initCheckout();
});
