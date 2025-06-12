package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Add custom queries if needed (e.g., findByCategory, search by keyword, etc.)
    List<Product> findByFeaturedTrue();

}
