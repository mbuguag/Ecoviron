<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Checkout | Ecoviron Shop</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../css/styles.css" />
</head>

<body>
  <div id="header-container"></div>

  <main>
    <section class="section-padding checkout-section">
      <div class="container">
        <h2>Checkout</h2>

        <div id="checkout-cart"></div>

        <form id="checkout-form" class="checkout-form">
          <!-- Billing Details -->
          <div class="form-section">
            <h3>Billing Details</h3>
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required />
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
              <label for="address">Shipping Address</label>
              <input type="text" id="address" name="address" required />
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-section">
            <h3>Payment Method</h3>
            <div class="form-group">
              <label for="payment">Select Payment Method</label>
              <select id="payment" name="payment" required>
                <option value="">Select...</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <!-- M-Pesa -->
            <div id="mpesa-phone-section" class="payment-details" style="display: none;">
              <div class="form-group">
                <label for="mpesa-phone">M-Pesa Phone Number</label>
                <input type="tel" id="mpesa-phone" name="mpesa-phone" 
                  placeholder="e.g. 254712345678" 
                  pattern="254[17][0-9]{8}"
                  title="Enter a valid M-Pesa number (2547XXXXXXXX)" />
              </div>
            </div>

            <!-- Card (placeholder) -->
            <div id="card-details-section" class="payment-details" style="display: none;">
              <!-- Card details can go here -->
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <h3>Order Summary</h3>
            <div id="checkout-summary"></div>
            <button id="place-order-btn" class="btn primary" type="submit">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>

  <div id="footer-container"></div>

  <!-- Load layout and logic scripts -->
  <script type="module" src="../js/main.js"></script>
  <!-- Simple inline fallback logic for payment toggles -->
  <script>
    document.getElementById('payment').addEventListener('change', function () {
      document.querySelectorAll('.payment-details').forEach((section) => {
        section.style.display = 'none';
      });

      const value = this.value;
      if (value === 'mpesa') {
        document.getElementById('mpesa-phone-section').style.display = 'block';
      } else if (value === 'card') {
        document.getElementById('card-details-section').style.display = 'block';
      }
    });
  </script>
</body>
</html>

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

why is my submit button redirecting me to the following url
Request URL
http://127.0.0.1:5500/ecommerce/thank-you.html
Request Method
GET
Status Code
404 Not Found
Remote Address
127.0.0.1:5500
Referrer Policy
strict-origin-when-cross-origin 

