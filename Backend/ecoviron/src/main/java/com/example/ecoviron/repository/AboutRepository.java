package com.example.ecoviron.repository;

import com.example.ecoviron.entity.About;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AboutRepository extends JpaRepository<About, Long> {
    List<About> findAllByOrderByIdAsc();
}
