package com.example.ecoviron.service;

import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.User;

public interface CartService {
    Cart getCartByUser(User user);
    Cart addItemToCart(User user, Long productId, int quantity);
    Cart updateItemQuantity(User user, Long itemId, int quantity);
    void removeItemFromCart(User user, Long itemId);
    void clearCart(User user);
}
