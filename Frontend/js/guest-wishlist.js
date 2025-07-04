const GUEST_WISHLIST_KEY = "guest_wishlist";

export function getGuestWishlist() {
  return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
}

export function addToGuestWishlist(productId) {
  const list = getGuestWishlist();
  if (!list.includes(productId)) {
    list.push(productId);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(list));
  }
}
