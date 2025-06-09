package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
}
