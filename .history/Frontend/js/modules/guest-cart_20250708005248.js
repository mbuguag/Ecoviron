export const GuestCart = {
  get() {
    const data = localStorage.getItem("guest_cart");
    return data ? JSON.parse(data) : [];
  },
  add(product, quantity = 1) {
    const cart = this.get();
    const existing = cart.find(
      (i) => i.productId === product.id || i.id === product.id
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  },
  update(productId, quantity) {
    const cart = this.get();
    const item = cart.find(
      (i) => i.productId === productId || i.id === productId
    );
    if (item) {
      item.quantity = quantity;
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
  },
  remove(productId) {
    const cart = this.get().filter(
      (i) => i.productId !== productId && i.id !== productId
    );
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  },
  clear() {
    localStorage.removeItem("guest_cart");
  },
};
