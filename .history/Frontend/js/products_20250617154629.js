import { loadLayoutComponents } from './domUtils.js';
import { fetchProducts } from './api.js';
import { setupCartInteractions } from './cart.js';

document.addEventListener("DOMContentLoaded", async () => {
    await loadLayoutComponents();
    await loadAndRenderProducts();
    setupFilterButtons();
});


async function loadAndRenderProducts() {
    try {
        const products = await fetchProducts();
        renderProductGrid(products);
        setupCartInteractions(); // For "Add to Cart" buttons
    } catch (error) {
        document.getElementById("product-grid").innerHTML = `
            <div class="error-message">
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
        console.error("API Error:", error);
    }
}

function renderProductGrid(products) {
    const gridContainer = document.getElementById("product-grid");
    gridContainer.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <a href="product-details.html?id=${product.id}">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" />
            </a>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <button class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join("");
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".product-filter button");
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            filterProducts(filter);
        });
    });
}

function filterProducts(filter) {
    const allProducts = document.querySelectorAll(".product-card");
    allProducts.forEach(product => {
        const showProduct = filter === "all" || product.dataset.category === filter;
        product.style.display = showProduct ? "block" : "none";
    });
}

function formatPrice(price) {
    return `KES ${price.toLocaleString()}`;
}