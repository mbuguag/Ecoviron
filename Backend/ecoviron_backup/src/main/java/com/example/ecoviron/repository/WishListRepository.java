package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Product;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.entity.WishListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishListRepository extends JpaRepository<WishListItem, Long> {
    List<WishListItem> findByUser(User user);
    boolean existsByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
}
