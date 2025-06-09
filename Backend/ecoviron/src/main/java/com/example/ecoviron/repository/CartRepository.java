package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
