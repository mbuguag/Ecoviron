import { productData } from "./productData.js";

const API_BASE_URL = "http://localhost:8080/api";
const ORDER_SUCCESS_URL = "order-success.html";
const LOGIN_URL = "login.html";

// DOM Elements
const elements = {
  form: document.getElementById("checkout-form"),
  summaryContainer: document.getElementById("checkout-summary"),
  paymentSelect: document.getElementById("payment"),
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
    elements.summaryContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="products.html" class="btn primary">Continue Shopping</a>
      </div>
    `;
    elements.form.style.display = "none";
    return;
  }

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
