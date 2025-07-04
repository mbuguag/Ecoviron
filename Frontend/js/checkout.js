import { layoutLoaded } from "./main.js";

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";
const LOGIN_URL = "login.html";

// DOM Elements
const elements = {
  form: document.getElementById("checkout-form"),
  summaryContainer: document.getElementById("checkout-summary"),
  paymentSelect: document.getElementById("payment"),
<<<<<<< HEAD
  mpesaPhoneInput: document.getElementById("mpesa-phone"),
};

// Load cart items from localStorage
function getCartItems() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Format currency
function formatPrice(amount) {
  return `KES ${Number(amount).toLocaleString()}`;
}

// Render order summary
function renderCheckoutSummary() {
  const cart = getCartItems();
  if (cart.length === 0) {
=======
  mpesaSection: document.getElementById("mpesa-phone-section"),
};

// Utility Functions
const getCartItems = () => JSON.parse(localStorage.getItem("cart") || "[]");

const calculateOrderSummary = () => {
  const cart = getCartItems();
  let total = 0;

  const items = cart
    .map((item) => {
      const product = productData[item.id];
      if (!product) return null;

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return {
        productId: item.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        itemTotal,
      };
    })
    .filter(Boolean);

  return { items, total };
};

const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

// Rendering Functions
const renderCheckoutSummary = () => {
  const { items, total } = calculateOrderSummary();

  if (items.length === 0) {
>>>>>>> ecoviron_branch
    elements.summaryContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="products.html" class="btn primary">Continue Shopping</a>
<<<<<<< HEAD
      </div>`;
=======
      </div>
    `;
>>>>>>> ecoviron_branch
    elements.form.style.display = "none";
    return;
  }

<<<<<<< HEAD
  let total = 0;
  let html = `<h4>Order Items</h4><ul class="checkout-items">`;

  for (const item of cart) {
    const price = item.price;
    const quantity = item.quantity;
    const itemTotal = price * quantity;
    total += itemTotal;

    html += `
      <li class="checkout-item">
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">${quantity} x ${formatPrice(price)}</span>
        <span class="item-total">${formatPrice(itemTotal)}</span>
      </li>`;
  }

  html += `</ul>
    <div class="order-total">
      <span>Total:</span>
      <strong>${formatPrice(total)}</strong>
    </div>`;

  elements.summaryContainer.innerHTML = html;
}

// Validate form inputs
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

// Handle order submission
async function submitOrder(event) {
  event.preventDefault();

  try {
    const cart = getCartItems();
    if (cart.length === 0) throw new Error("Cart is empty.");

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

    const orderPayload = {
      items: orderItems,
      totalAmount,
      customerDetails: { name, email, shippingAddress: address },
      paymentMethod,
    };

    validateForm({ name, email, address, paymentMethod, mpesaPhone });

    const res = await fetch(`${API_BASE_URL}/orders/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });
    console.log("Order save response status:", res.status);
    console.log("Order save response headers:", res.headers);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to place order.");
    }

    const { orderReference } = await res.json();

    if (paymentMethod === "mpesa") {
      await initiateMpesaPayment(mpesaPhone, totalAmount, orderReference);
    }

    localStorage.removeItem("cart");
    window.location.href = ORDER_SUCCESS_URL;
  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

// Trigger M-Pesa payment
async function initiateMpesaPayment(phone, amount, orderReference) {
  const res = await fetch(`${API_BASE_URL}/payment/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount: String(amount), orderReference }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to initiate M-Pesa payment.");
  }

  alert("M-Pesa request sent. Complete payment on your phone.");
}

// Init page
function initCheckout() {
  renderCheckoutSummary();
  elements.form.addEventListener("submit", submitOrder);
}

document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;
  initCheckout();
});
=======
  let html = `
    <h4>Order Items</h4>
    <ul class="checkout-items">
      ${items
        .map(
          (item) => `
        <li class="checkout-item">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">${item.quantity} x ${formatCurrency(
            item.price
          )}</span>
          <span class="item-total">${formatCurrency(item.itemTotal)}</span>
        </li>
      `
        )
        .join("")}
    </ul>
    <div class="order-total">
      <span>Total:</span>
      <strong>${formatCurrency(total)}</strong>
    </div>
  `;

  elements.summaryContainer.innerHTML = html;
};

// Payment Handling
const handlePaymentMethodChange = () => {
  elements.paymentSelect.addEventListener("change", () => {
    elements.mpesaSection.style.display =
      elements.paymentSelect.value === "mpesa" ? "block" : "none";
  });
};

const validateForm = (formData) => {
  const { name, email, address, paymentMethod, mpesaPhone } = formData;

  if (!name || !email || !address || !paymentMethod) {
    throw new Error("Please fill in all required fields.");
  }

  if (paymentMethod === "mpesa" && !mpesaPhone) {
    throw new Error("Please enter your M-Pesa phone number.");
  }

  if (!/^254[17]\d{8}$/.test(mpesaPhone) && paymentMethod === "mpesa") {
    throw new Error(
      "Please enter a valid M-Pesa phone number (format: 2547XXXXXXXX)."
    );
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
};

const submitOrder = async (event) => {
  event.preventDefault();

  try {
    const { items, total } = calculateOrderSummary();
    if (items.length === 0) throw new Error("Your cart is empty.");

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      window.location.href = LOGIN_URL;
      return;
    }

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      paymentMethod: elements.paymentSelect.value,
      mpesaPhone: document.getElementById("mpesa-phone")?.value.trim() || "",
    };

    validateForm(formData);

    const orderPayload = {
      items,
      totalAmount: total,
      customerDetails: {
        name: formData.name,
        email: formData.email,
        shippingAddress: formData.address,
      },
      paymentMethod: formData.paymentMethod,
    };

    const orderResponse = await fetch(`${API_BASE_URL}/orders/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || "Failed to place order");
    }

    const order = await orderResponse.json();

    if (formData.paymentMethod === "mpesa") {
      await initiateMpesaPayment(
        formData.mpesaPhone,
        total,
        order.orderReference
      );
    }

    localStorage.removeItem("cart");
    window.location.href = ORDER_SUCCESS_URL;
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("Order submission error:", error);
  }
};

const initiateMpesaPayment = async (phone, amount, orderReference) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        amount: String(amount),
        orderReference,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Payment initiation failed");
    }

    alert(
      "M-Pesa payment request sent! Please check your phone to complete payment."
    );
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    throw new Error("Failed to initiate M-Pesa payment. Please try again.");
  }
};

// Initialize
const initCheckout = () => {
  renderCheckoutSummary();
  handlePaymentMethodChange();
  elements.form.addEventListener("submit", submitOrder);
};

document.addEventListener("DOMContentLoaded", initCheckout);
>>>>>>> ecoviron_branch
