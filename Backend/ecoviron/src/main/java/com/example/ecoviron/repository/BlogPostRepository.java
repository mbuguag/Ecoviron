package com.example.ecoviron.repository;

import com.example.ecoviron.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository  extends JpaRepository<BlogPost, Long> {
}
