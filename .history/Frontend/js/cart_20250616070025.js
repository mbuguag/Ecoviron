// cart.js - Complete Cart Management System
import { API_BASE_URL } from './apiConfig.js';

// DOM Elements
const cartContainer = document.getElementById('cart-container');
const cartCountBadge = document.querySelectorAll('.cart-count-badge');

// Cart State Management
let cart = [];


export async function initCart() {
  await loadCart();
  renderCart();
  updateCartCount();
  setupEventListeners();
}

// Load Cart (Tries API first, falls back to localStorage)
async function loadCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      credentials: 'include' // For session/cookie auth
    });
    
    if (response.ok) {
      cart = await response.json();
      syncLocalStorage();
      return;
    }
  } catch (error) {
    console.error('API cart load failed, using localStorage', error);
  }

  // Fallback to localStorage
  const localCart = JSON.parse(localStorage.getItem('cart') || []);
  
  // If we have items in localStorage but not in memory, try to sync with backend
  if (localCart.length > 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localCart),
        credentials: 'include'
      });
      
      if (response.ok) {
        cart = await response.json();
        localStorage.removeItem('cart'); // Clear after successful sync
        return;
      }
    } catch (error) {
      console.error('Cart sync failed', error);
    }
  }
  
  cart = localCart;
}

// Save Cart (Tries API first, falls back to localStorage)
async function saveCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart),
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('API save failed');
    syncLocalStorage();
    return true;
  } catch (error) {
    console.error('API cart save failed, using localStorage', error);
    localStorage.setItem('cart', JSON.stringify(cart));
    return false;
  }
}

// Sync localStorage with current cart
function syncLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Render Cart UI
function renderCart() {
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="icon-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Browse our products to find something you like</p>
        <a href="/products" class="btn primary">Continue Shopping</a>
      </div>
    `;
    return;
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const tax = calculateTax(subtotal);
  const total = subtotal + shipping + tax;

  cartContainer.innerHTML = `
    <div class="cart-items">
      <table>
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
          ${cart.map((item, index) => `
            <tr data-product-id="${item.id}">
              <td class="product-info">
                <img src="${item.image || '/images/placeholder-product.jpg'}" 
                     alt="${item.name}" 
                     class="product-thumbnail">
                <div>
                  <h4>${item.name}</h4>
                  ${item.variant ? `<p class="variant">${item.variant}</p>` : ''}
                  ${item.stock <= 5 ? `<p class="low-stock">Only ${item.stock} left!</p>` : ''}
                </div>
              </td>
              <td class="price">${formatCurrency(item.price)}</td>
              <td class="quantity">
                <button class="btn qty-btn minus" data-index="${index}">−</button>
                <input type="number" 
                       value="${item.quantity}" 
                       min="1" 
                       max="${item.stock || 10}" 
                       class="qty-input"
                       data-index="${index}">
                <button class="btn qty-btn plus" data-index="${index}">+</button>
              </td>
              <td class="price">${formatCurrency(item.price * item.quantity)}</td>
              <td>
                <button class="btn icon-btn remove-btn" data-index="${index}">
                  <i class="icon-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="cart-summary">
      <div class="summary-card">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
        </div>
        <div class="summary-row">
          <span>Tax</span>
          <span>${formatCurrency(tax)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <button class="btn primary checkout-btn">Proceed to Checkout</button>
        <button class="btn secondary continue-shopping-btn">Continue Shopping</button>
      </div>
    </div>
  `;
}

// Event Listeners
function setupEventListeners() {
  // Delegate all cart interactions
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.qty-btn')) {
      const btn = e.target.closest('.qty-btn');
      const index = btn.dataset.index;
      const isPlus = btn.classList.contains('plus');
      await updateQuantity(index, isPlus ? 1 : -1);
    }
    
    if (e.target.closest('.remove-btn')) {
      const btn = e.target.closest('.remove-btn');
      const index = btn.dataset.index;
      await removeItem(index);
    }
    
    if (e.target.closest('.checkout-btn')) {
      window.location.href = '/checkout';
    }
  });

  // Handle direct input changes
  document.addEventListener('change', async (e) => {
    if (e.target.classList.contains('qty-input')) {
      const input = e.target;
      const index = input.dataset.index;
      const newQty = parseInt(input.value);
      
      if (newQty >= 1 && newQty <= (cart[index].stock || 999)) {
        await setQuantity(index, newQty);
      } else {
        showToast(`Quantity must be between 1 and ${cart[index].stock || 999}`);
        input.value = cart[index].quantity; // Reset to current value
      }
    }
  });
}

// Cart Operations
async function updateQuantity(index, change) {
  const newQty = cart[index].quantity + change;
  
  if (newQty < 1) {
    await removeItem(index);
    return;
  }
  
  if (cart[index].stock && newQty > cart[index].stock) {
    showToast(`Only ${cart[index].stock} available`);
    return;
  }
  
  cart[index].quantity = newQty;
  await saveCart();
  renderCart();
  updateCartCount();
  showToast('Cart updated');
}

async function setQuantity(index, quantity) {
  if (quantity < 1) {
    await removeItem(index);
    return;
  }
  
  cart[index].quantity = quantity;
  await saveCart();
  renderCart();
  updateCartCount();
  showToast('Cart updated');
}

async function removeItem(index) {
  const removedItem = cart.splice(index, 1)[0];
  await saveCart();
  renderCart();
  updateCartCount();
  showToast(`${removedItem.name} removed from cart`);
}

export async function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart = [];
    await saveCart();
    renderCart();
    updateCartCount();
    showToast('Cart cleared');
  }
}

// Product Operations
export async function addToCart(product, quantity = 1, variant = null) {
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && 
    (!variant || item.variant === variant)
  );
  
  if (existingIndex >= 0) {
    // Update existing item
    const newQty = cart[existingIndex].quantity + quantity;
    
    if (product.stock && newQty > product.stock) {
      showToast(`Only ${product.stock} available`);
      return false;
    }
    
    cart[existingIndex].quantity = newQty;
  } else {
    // Add new item
    if (product.stock && quantity > product.stock) {
      showToast(`Only ${product.stock} available`);
      return false;
    }
    
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant,
      stock: product.stock,
      quantity
    });
  }
  
  await saveCart();
  renderCart();
  updateCartCount();
  showToast(`${product.name} added to cart`);
  return true;
}

// Helper Functions
function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateShipping() {
  // Free shipping over $50, otherwise $5.99
  const subtotal = calculateSubtotal();
  return subtotal > 5000 ? 0 : 599; // Amounts in cents
}

function calculateTax(subtotal) {
  // Example: 8.25% tax rate
  return Math.round(subtotal * 0.0825);
}

function formatCurrency(amount) {
  // Convert cents to dollars for display
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <span>${message}</span>
    <a href="/cart" class="toast-link">View Cart</a>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('fade-out'), 3000);
  setTimeout(() => toast.remove(), 3500);
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  initCart();
} else {
  document.addEventListener('DOMContentLoaded', initCart);
}