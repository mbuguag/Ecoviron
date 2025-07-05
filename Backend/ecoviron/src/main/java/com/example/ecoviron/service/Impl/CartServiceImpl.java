package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.CartItem;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.CartItemRepository;
import com.example.ecoviron.repository.CartRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Cart getCartByUser(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());
            return cartRepository.save(cart);
        });
    }

    @Override
    public Cart addItemToCart(User user, Long productId, int quantity) {
        Cart cart = getCartByUser(user);

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // If item exists, update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            // Else, create and add new CartItem
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);

            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart); // Save updated cart and items
    }


    @Override
    public Cart updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getCartByUser(user);
        for (CartItem item : cart.getItems()) {
            if (item.getId().equals(itemId)) {
                item.setQuantity(quantity);
                break;
            }
        }
        return cartRepository.save(cart);
    }

    @Override
    public void removeItemFromCart(User user, Long itemId) {
        Cart cart = getCartByUser(user);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cartRepository.save(cart);
    }

    @Override
    public void clearCart(User user) {
        Cart cart = getCartByUser(user);
        cartItemRepository.deleteByCart(cart);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
