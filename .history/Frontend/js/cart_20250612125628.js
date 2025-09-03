import { productData } from "./productData.js";

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const container = document.getElementById("cart-container");
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let html = `<table class="cart-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody>`;
  let total = 0;

  cart.forEach((item, index) => {
    const product = productData[item.id];
    if (product) {
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      html += `
        <tr>
          <td><img src="${product.image}" alt="${product.name}" class="cart-img"/> ${product.name}</td>
          <td><input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" /></td>
          <td>KES ${product.price}</td>
          <td>KES ${itemTotal}</td>
          <td><button onclick="removeItem(${index})" class="btn danger small">Remove</button></td>
        </tr>`;
    }
  });

  html += `</tbody></table><p class="total-amount">Grand Total: KES ${total.toLocaleString()}</p>`;
  html += `<a href="checkout.html" class="btn primary">Proceed to Checkout</a>`;
  container.innerHTML = html;
}

window.updateQuantity = function(index, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  quantity = parseInt(quantity);
  if (quantity < 1) return;
  cart[index].quantity = quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
};

window.removeItem = function(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
};

window.clearCart = function() {
  if (confirm("Are you sure you want to clear the cart?")) {
    localStorage.removeItem("cart");
    loadCart();
  }
};

window.addEventListener("DOMContentLoaded", loadCart);
