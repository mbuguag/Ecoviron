import { loadLayoutComponents } from './domUtils.js';
import { fetchAllProducts, fetchProductById } from './api.js';
import { setupCartInteractions } from './cart.js';

document.addEventListener("DOMContentLoaded", async () => {
    await loadLayoutComponents();
    await loadAndRenderProducts();
    setupFilterButtons();
});


function formatPrice(price) {
    return `KES ${price.toLocaleString()}`;
}