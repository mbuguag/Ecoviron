package com.example.ecoviron.service;

import com.example.ecoviron.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BlogService {
    List<BlogPost> getAllPosts();
    Page<BlogPost> getPaginatedPosts(Pageable pageable);
    BlogPost getPostById(Long id);
    BlogPost createPost(BlogPost blogPost);
    BlogPost updatePost(Long id, BlogPost updatedPost);
    void deletePost(Long id);
}
