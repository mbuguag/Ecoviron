package com.example.ecoviron.repository;

import com.example.ecoviron.entity.OrderItem;
import com.example.ecoviron.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    long countByProduct(Product product);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    long countByProductId(Long productId);
}
