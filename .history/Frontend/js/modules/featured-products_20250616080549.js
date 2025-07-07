import { formatPrice } from './utils.js';

const featuredProducts = [
  {
    name: "Reusable Water Bottle",
    price: 850,
    image: "assets/images/products/water-bottle.jpg",
    id: 1
  },
  // ... other products
];

export function initFeaturedProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  container.innerHTML = featuredProducts.map(product => `
    <div class="product-card">
      <a href="ecommerce/product-details.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p class="price">${formatPrice(product.price)}</p>
      </a>
    </div>
  `).join('');
}