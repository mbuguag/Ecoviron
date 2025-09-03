import { productData } from "./productData.js";

// DOM Elements
const cartContainer = document.getElementById("cart-container");
const clearCartBtn = document.getElementById("clear-cart-btn");

// Initialize cart
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", clearCart);
    }
});

// Main cart rendering function
export function renderCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="product-grid.html" class="btn primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    let grandTotal = 0;

    cart.forEach((item, index) => {
        const product = productData[item.id];
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        grandTotal += itemTotal;

        html += `
            <tr>
                <td class="product-cell">
                    <img src="${product.image}" alt="${product.name}" class="cart-img" />
                    <span>${product.name}</span>
                </td>
                <td>${formatPrice(product.price)}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" 
                           data-index="${index}" class="quantity-input" />
                </td>
                <td>${formatPrice(itemTotal)}</td>
                <td>
                    <button data-index="${index}" class="btn danger small remove-btn">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div class="cart-summary">
            <p class="grand-total">Grand Total: ${formatPrice(grandTotal)}</p>
            <div class="cart-actions">
                <a href="product-grid.html" class="btn secondary">Continue Shopping</a>
                <a href="checkout.html" class="btn primary">Proceed to Checkout</a>
            </div>
        </div>
    `;

    cartContainer.innerHTML = html;

    // Add event listeners
    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("change", (e) => updateQuantity(e.target.dataset.index, e.target.value));
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => removeItem(e.target.dataset.index));
    });
}

// Helper functions
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function formatPrice(amount) {
    return `KES ${amount.toLocaleString()}`;
}

// Cart operations
function updateQuantity(index, newQuantity) {
    const cart = getCart();
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        showToast("Quantity must be at least 1");
        return;
    }

    cart[index].quantity = newQuantity;
    saveCart(cart);
    renderCart();
    showToast("Quantity updated");
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    showToast("Item removed");
}

function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem("cart");
        renderCart();
        showToast("Cart cleared");
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add to cart function (for use in product pages)
export function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }

    saveCart(cart);
    showToast("Added to cart!");
}