import { CartAPI } from "./cart/cart-api.js";
import { getGuestCart } from "./cart/guestCart.js";
import { fetchAllProducts, fetchProductById } from "./api.js";
import { isLoggedIn } from "./auth.js";
import { API_BASE_URL, STATIC_BASE_URL, formatPrice, getAssetPath } from "./apiConfig.js";

// Environment-aware image URL builder
function buildImageUrl(path) {
  if (!path) return "";
  
  // Handle absolute URLs (already complete)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Clean and normalize the path
  const cleanPath = path.replace(/^\/?uploads\//, "");
  
  // Use environment-specific base URL
  const imageBaseUrl = `${API_BASE_URL.replace('/api', '')}/uploads/`;
  return `${imageBaseUrl}${cleanPath}`;
}

// Enhanced error handling and retry logic
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

// Enhanced cart loading with better error handling
async function loadCartItems() {
  const container = document.getElementById("cart-container");
  
  // Show loading state
  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    `;
  }

  try {
    let items = [];

    if (isLoggedIn()) {
      items = await withRetry(async () => {
        const cart = await CartAPI.getCart();
        return cart.items || [];
      });
    } else {
      items = getGuestCart();
    }

    await renderCart(items);
  } catch (error) {
    console.error("Failed to load cart items:", error);
    
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h3>Unable to load cart</h3>
          <p>Please check your connection and try again.</p>
          <button onclick="loadCartItems()" class="btn btn-secondary">Retry</button>
        </div>
      `;
    }
  }
}

// Enhanced cart rendering with better error handling and accessibility
async function renderCart(items) {
  const container = document.getElementById("cart-container");
  if (!container) {
    console.error("Cart container not found");
    return;
  }

  try {
    let cartItems = items;

    // Handle guest cart items that need product details
    if (!isLoggedIn() && items.length > 0 && !items[0].product) {
      const productPromises = items.map(async (item) => {
        const productId = item.productId || item.id;
        if (!productId) return null;
        
        try {
          const product = await fetchProductById(productId);
          return { id: item.id, quantity: item.quantity, product };
        } catch (error) {
          console.warn(`Failed to fetch product ${productId}:`, error);
          return null;
        }
      });
      
      cartItems = (await Promise.all(productPromises)).filter(Boolean);
    } else {
      // Normalize authenticated cart items
      cartItems = items.map((item) => {
        const product = item.product || {
          id: item.productId,
          name: item.productName,
          imageUrl: item.productImage,
          price: item.price,
        };
        return { ...item, product };
      });
    }

    // Handle empty cart
    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Browse our products to add items to your cart.</p>
          <a href="products.html" class="btn btn-primary">Shop Now</a>
        </div>
      `;
      return;
    }

    // Calculate total with error handling
    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (quantity * price);
    }, 0);

    // Generate cart HTML with improved accessibility
    container.innerHTML = `
      <div class="cart-content">
        <h2>Shopping Cart (${cartItems.length} items)</h2>
        <ul class="cart-items" role="list">
          ${cartItems
            .map(
              (item, index) => `
            <li class="cart-item" 
                data-index="${index}" 
                data-id="${item.product.id}"
                data-qty="${item.quantity}" 
                data-item-id="${item.id || ""}"
                role="listitem">
              
              <div class="cart-item-image">
                ${
                  item.product.imageUrl
                    ? `<img src="${buildImageUrl(item.product.imageUrl)}" 
                           alt="${item.product.name}" 
                           class="cart-thumb"
                           loading="lazy"
                           onerror="this.style.display='none'" />`
                    : `<div class="no-image-placeholder" aria-label="No image available">📦</div>`
                }
              </div>

              <div class="cart-item-info">
                <div class="cart-item-header">
                  <h3>
                    <a href="product-details.html?id=${item.product.id}" 
                       class="product-link"
                       aria-label="View ${item.product.name} details">
                      ${item.product.name}
                    </a>
                  </h3>
                  <button class="remove-btn" 
                          title="Remove ${item.product.name} from cart"
                          aria-label="Remove ${item.product.name} from cart">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div class="quantity-controls" role="group" aria-label="Quantity controls">
                  <button class="qty-btn decrease" 
                          aria-label="Decrease quantity"
                          ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                  <span class="quantity" role="status" aria-label="Quantity: ${item.quantity}">${item.quantity}</span>
                  <button class="qty-btn increase" aria-label="Increase quantity">+</button>
                </div>
                
                <div class="item-total" role="status">
                  ${formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            </li>
          `
            )
            .join("")}
        </ul>
        
        <div class="cart-summary">
          <div class="total-row">
            <strong>Total: ${formatPrice(total)}</strong>
          </div>
        </div>
        
        <div class="cart-actions">
          <a href="checkout.html" 
             class="btn btn-primary proceed-checkout"
             role="button"
             ${cartItems.length === 0 ? 'aria-disabled="true"' : ''}>
            Proceed to Checkout
          </a>
          <a href="products.html" class="btn btn-secondary continue-shopping">
            Continue Shopping
          </a>
        </div>
      </div>
    `;

    // Setup interactive elements
    setupQuantityButtons(cartItems);
    setupRemoveButtons(cartItems);

  } catch (error) {
    console.error("Cart render error:", error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Error displaying cart</h3>
        <p>We're having trouble displaying your cart. Please try again.</p>
        <button onclick="loadCartItems()" class="btn btn-secondary">Retry</button>
      </div>
    `;
  }
}

// Enhanced quantity button handling with optimistic updates
function setupQuantityButtons(cartItems) {
  const container = document.getElementById("cart-container");
  if (!container) return;

  container.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const itemEl = btn.closest(".cart-item");
      const index = parseInt(itemEl.dataset.index, 10);
      const itemId = itemEl.dataset.itemId;
      let quantity = parseInt(itemEl.dataset.qty, 10);
      const product = cartItems[index]?.product;

      if (!product) {
        console.error("Product not found for cart item");
        return;
      }

      // Calculate new quantity
      const isIncrease = btn.classList.contains("increase");
      const isDecrease = btn.classList.contains("decrease");
      
      if (isIncrease) {
        quantity += 1;
      } else if (isDecrease && quantity > 1) {
        quantity -= 1;
      } else {
        return; // No change needed
      }

      // Disable buttons during update
      const allBtns = itemEl.querySelectorAll(".qty-btn");
      allBtns.forEach(b => b.disabled = true);

      try {
        // Update backend
        if (isLoggedIn()) {
          await withRetry(() => CartAPI.updateQuantity(itemId, quantity));
        } else {
          updateGuestQuantity(product.id, quantity);
        }

        // Update UI optimistically
        itemEl.dataset.qty = quantity;
        const quantitySpan = itemEl.querySelector(".quantity");
        const itemTotalSpan = itemEl.querySelector(".item-total");
        
        if (quantitySpan) {
          quantitySpan.textContent = quantity;
          quantitySpan.setAttribute("aria-label", `Quantity: ${quantity}`);
        }
        
        if (itemTotalSpan) {
          itemTotalSpan.textContent = formatPrice(quantity * product.price);
        }

        // Update decrease button state
        const decreaseBtn = itemEl.querySelector(".qty-btn.decrease");
        if (decreaseBtn) {
          decreaseBtn.disabled = quantity <= 1;
        }

        // Recalculate total
        recalculateCartTotal();

      } catch (err) {
        console.error("Failed to update quantity:", err);
        
        // Show user-friendly error
        const errorDiv = document.createElement("div");
        errorDiv.className = "quantity-error";
        errorDiv.textContent = "Failed to update quantity. Please try again.";
        itemEl.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 3000);
      } finally {
        // Re-enable buttons
        allBtns.forEach(b => b.disabled = false);
      }
    });
  });
}

// Enhanced total recalculation
function recalculateCartTotal() {
  const cartItems = document.querySelectorAll(".cart-item");
  let total = 0;

  cartItems.forEach((item) => {
    const quantity = parseInt(item.dataset.qty, 10) || 0;
    const itemTotalText = item.querySelector(".item-total")?.textContent || "";
    
    // Extract numeric value from formatted price
    const numericMatch = itemTotalText.match(/[\d,.]+/);
    if (numericMatch) {
      const numericValue = parseFloat(numericMatch[0].replace(/,/g, ""));
      if (!isNaN(numericValue)) {
        total += numericValue;
      }
    }
  });

  const totalEl = document.querySelector(".cart-summary .total-row strong");
  if (totalEl) {
    totalEl.textContent = `Total: ${formatPrice(total)}`;
  }

  // Update checkout button state
  const checkoutBtn = document.querySelector(".proceed-checkout");
  if (checkoutBtn) {
    if (total <= 0) {
      checkoutBtn.setAttribute("aria-disabled", "true");
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.6";
    } else {
      checkoutBtn.removeAttribute("aria-disabled");
      checkoutBtn.style.pointerEvents = "";
      checkoutBtn.style.opacity = "";
    }
  }
}

// Enhanced remove button handling
function setupRemoveButtons(cartItems) {
  const container = document.getElementById("cart-container");
  if (!container) return;

  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const itemEl = btn.closest(".cart-item");
      const itemId = itemEl.dataset.itemId;
      const productId = parseInt(itemEl.dataset.id, 10);
      const product = cartItems.find(
        (item) => item.product.id === productId
      )?.product;

      if (!product) {
        console.error("Product not found for removal");
        return;
      }

      // Enhanced confirmation dialog
      const confirmed = confirm(
        `Remove "${product.name}" from your cart?\n\nThis action cannot be undone.`
      );
      if (!confirmed) return;

      // Show removing state
      itemEl.style.opacity = "0.6";
      btn.disabled = true;
      btn.textContent = "Removing...";

      try {
        if (isLoggedIn()) {
          await withRetry(() => CartAPI.removeItem(itemId));
        } else {
          removeGuestCartItem(productId);
        }
        
        // Reload cart to reflect changes
        await loadCartItems();
        
      } catch (err) {
        console.error("Remove item failed:", err);
        
        // Reset UI state on error
        itemEl.style.opacity = "";
        btn.disabled = false;
        btn.innerHTML = '<span aria-hidden="true">×</span>';
        
        alert("Failed to remove item. Please try again.");
      }
    });
  });
}

// Enhanced guest cart functions with validation
function removeGuestCartItem(productId) {
  try {
    let cart = getGuestCart();
    const originalLength = cart.length;
    
    cart = cart.filter(
      (item) => item.productId !== productId && item.id !== productId
    );
    
    if (cart.length < originalLength) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      console.log(`Removed product ${productId} from guest cart`);
    } else {
      console.warn(`Product ${productId} not found in guest cart`);
    }
  } catch (error) {
    console.error("Failed to remove guest cart item:", error);
    throw error;
  }
}

function updateGuestQuantity(productId, quantity) {
  try {
    const cart = getGuestCart();
    const index = cart.findIndex(
      (item) => item.productId === productId || item.id === productId
    );
    
    if (index > -1) {
      cart[index].quantity = Math.max(1, parseInt(quantity, 10));
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      console.log(`Updated product ${productId} quantity to ${quantity}`);
    } else {
      console.warn(`Product ${productId} not found in guest cart`);
      throw new Error(`Product not found in cart`);
    }
  } catch (error) {
    console.error("Failed to update guest cart quantity:", error);
    throw error;
  }
}

// Initialize on DOM ready with error handling
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadCartItems();
  } catch (error) {
    console.error("Failed to initialize cart:", error);
  }
});

// Expose functions globally for button onclick handlers
window.loadCartItems = loadCartItems;