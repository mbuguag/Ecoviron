package com.example.ecoviron.service;

import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.User;

public interface CartService {

    // Entity (for business logic)
    Cart getCartEntityByUser(User user);

    // DTO (for controllers / API responses)
    CartResponseDto getCartByUser(User user);

    CartResponseDto addItemToCart(User user, Long productId, int quantity);

    CartResponseDto updateItemQuantity(User user, Long itemId, int quantity);

    void removeItemFromCart(User user, Long itemId);

    void clearCart(User user);
}
