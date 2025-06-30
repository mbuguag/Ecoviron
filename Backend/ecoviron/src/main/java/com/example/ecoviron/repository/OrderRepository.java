package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    long countByStatus(OrderStatus status);

    List<Order> findByUserAndStatus(User user, OrderStatus status);
    List<Order> findByStatus(OrderStatus status);

    Optional<Order> findByOrderReference(String orderReference);
}
