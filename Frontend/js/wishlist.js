export function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlistItems")) || [];
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
  localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
}

export function removeFromWishlist(productId) {
  const wishlist = getWishlist().filter((id) => id !== productId);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
}
