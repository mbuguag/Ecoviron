package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.CartItem;
import com.example.ecoviron.entity.Product;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.mapper.CartMapper;
import com.example.ecoviron.repository.CartRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Cart getCartEntityByUser(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCartByUser(User user) {
        Cart cart = getCartEntityByUser(user);
        return CartMapper.toDto(cart); // ✅ maps safely
    }

    @Override
    @Transactional
    public CartResponseDto addItemToCart(User user, Long productId, int quantity) {
        Cart cart = getCartEntityByUser(user);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product); // ✅ attached entity
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return CartMapper.toDto(savedCart); // ✅ DTO mapping
    }

    @Override
    @Transactional
    public CartResponseDto updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getCartEntityByUser(user);

        cart.getItems().forEach(item -> {
            if (item.getId().equals(itemId)) {
                item.setQuantity(quantity);
            }
        });

        Cart savedCart = cartRepository.save(cart);
        return CartMapper.toDto(savedCart);
    }

    @Override
    @Transactional
    public void removeItemFromCart(User user, Long itemId) {
        Cart cart = getCartEntityByUser(user);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getCartEntityByUser(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}

