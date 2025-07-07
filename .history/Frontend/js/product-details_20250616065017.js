import { loadLayoutComponents } from './domUtils.js';
import { fetchProductById } from './api.js';
import { addToCart } from './cart.js';

// DOM Elements
const productDetailContainer = document.getElementById("product-detail");

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
    await loadLayoutComponents();
    await loadProductDetail();
});

async function loadProductDetail() {
    const productId = getProductIdFromURL();
    
    if (!productId) {
        renderNotFound();
        return;
    }

    try {
        const product = await fetchProductById(productId);
        renderProductDetail(product);
    } catch (error) {
        renderError();
        console.error("Error loading product:", error);
    }
}

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderProductDetail(product) {
    productDetailContainer.innerHTML = `
        <div class="product-detail-card">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" />
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p>${product.description}</p>
                <button class="btn" id="add-to-cart-btn">Add to Cart</button>
            </div>
        </div>
    `;

    document.getElementById("add-to-cart-btn").addEventListener("click", () => handleAddToCart(product.id));
}

function renderNotFound() {
    productDetailContainer.innerHTML = `
        <div class="not-found">
            <p>Sorry, the product you're looking for was not found.</p>
            <a href="/frontend/ecommerce/product-grid.html" class="btn">Return to Shop</a>
        </div>
    `;
}

function renderError() {
    productDetailContainer.innerHTML = `
        <div class="error">
            <p>Failed to load product details. Please try again later.</p>
        </div>
    `;
}

function formatPrice(price) {
    return `KES ${parseInt(price).toLocaleString()}`;
}

async function handleAddToCart(productId) {
    try {
        await addToCart(productId, 1);
        showToast("Product added to cart!");
    } catch (error) {
        showToast("Failed to add to cart. Please try again.");
    }
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}