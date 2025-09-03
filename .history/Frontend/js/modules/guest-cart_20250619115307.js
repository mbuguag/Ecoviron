const STORAGE_KEY = 'guest_cart';

export function getGuestCart() {
    const cart = localStorage.getItem(STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
}

export function addToGuestCart(productId, quantity = 1) {
    const cart = getGuestCart();
    const index = cart.findIndex(item => item.productId === productId);

    if (index !== -1) {
        cart[index].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
    localStorage.removeItem(STORAGE_KEY);
}

export function removeFromGuestCart(productId) {
    const cart = getGuestCart().filter(item => item.productId !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
