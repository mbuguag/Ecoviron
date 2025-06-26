package com.example.ecoviron.service;

import com.example.ecoviron.entity.BlogPost;

import java.util.List;

public interface BlogService {
    List<BlogPost> getAllPosts();
    BlogPost getPostById(Long id);
    BlogPost createPost(BlogPost blogPost);
    BlogPost updatePost(Long id, BlogPost updatedPost);
    void deletePost(Long id);
}
