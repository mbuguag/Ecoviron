import { productData } from './productData.js';

// DOM Elements
const cartContainer = document.getElementById('cart-container');
const clearCartBtn = document.getElementById('clear-cart-btn');

// Initialize Cart
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    setupEventListeners();
});

// Render Cart Function
function renderCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="../ecommerce/product-grid.html" class="btn primary">Browse Products</a>
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
                    <th></th>
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
                    <input type="number" 
                           min="1" 
                           value="${item.quantity}" 
                           class="quantity-input"
                           data-index="${index}">
                </td>
                <td>${formatPrice(itemTotal)}</td>
                <td>
                    <button class="btn danger small remove-btn" data-index="${index}">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <p class="total-amount">Grand Total: ${formatPrice(grandTotal)}</p>
        <a href="checkout.html" class="btn primary">Proceed to Checkout</a>
    `;

    cartContainer.innerHTML = html;
}

// Event Listeners Setup
function setupEventListeners() {
    // Quantity changes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const index = e.target.dataset.index;
            const newQuantity = parseInt(e.target.value);
            updateQuantity(index, newQuantity);
        }
    });

    // Remove buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            removeItem(index);
        }
    });

    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
}

// Cart Operations
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        showToast('Quantity must be at least 1');
        return;
    }

    const cart = getCart();
    cart[index].quantity = newQuantity;
    saveCart(cart);
    renderCart();
    showToast('Quantity updated');
}

function removeItem(index) {
    const cart = getCart();
    const removedItem = cart.splice(index, 1)[0];
    saveCart(cart);
    renderCart();
    showToast(`${removedItem ? productData[removedItem.id].name : 'Item'} removed from cart`);
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        renderCart();
        showToast('Cart cleared');
    }
}

// Helper Functions
function formatPrice(amount) {
    return `KES ${amount.toLocaleString()}`;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export for use in other files
export function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }

    saveCart(cart);
    showToast('Added to cart!');
}