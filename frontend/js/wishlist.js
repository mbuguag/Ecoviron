const WISHLIST_KEY = "wishlistItems";

export function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
}

export function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(productId);
  if (index >= 0) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

// ✅ NEW: Exported addToWishlist
export function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
}

// ✅ NEW: Exported removeFromWishlist (already existed, just ensure it's exported)
export function removeFromWishlist(productId) {
  const wishlist = getWishlist().filter((id) => id !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

// ✅ NEW: Exported toggleWishlistIcon
export function toggleWishlistIcon(iconElement, isActive) {
  iconElement.classList.toggle("fas", isActive);
  iconElement.classList.toggle("far", !isActive);
}
