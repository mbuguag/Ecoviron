package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.CartItem;
import com.example.ecoviron.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart_User(User user);
    Optional<CartItem> findByCartUserAndProductId(User user, Long productId);
    void deleteByCart(Cart cart);

}
