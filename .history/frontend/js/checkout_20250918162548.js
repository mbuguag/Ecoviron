import { API_BASE_URL, BASE_PATH } from "./apiConfig.js";
import { formatPrice } from "./apiConfig.js";

document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      alert("⚠ You must be logged in to checkout.");
      window.location.href = `${BASE_PATH}login.html`;
      return;
    }

    try {
      // ✅ Call the new unified checkout endpoint
      const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      const data = await res.json();
      console.log("Checkout response:", data);

      // ✅ Show confirmation message
      alert(
        `📲 STK Push sent to ${phone}\n\n` +
        `Order: ${data.order.orderReference}\n` +
        `Amount: ${formatPrice(data.order.totalAmount)}`
      );

      // ✅ Redirect to pending page with orderRef
      window.location.href = `${BASE_PATH}order-pending.html?orderRef=${encodeURIComponent(data.order.orderReference)}`;

    } catch (err) {
      console.error("Checkout failed:", err);
      alert(`❌ Checkout failed: ${err.message}`);
    }
  });
});
