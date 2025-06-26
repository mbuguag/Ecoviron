package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.repository.BlogPostRepository;
import com.example.ecoviron.service.BlogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogServiceImpl  implements BlogService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Override
    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    @Override
    public BlogPost getPostById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog post not found with ID: " + id));
    }

    @Override
    public BlogPost createPost(BlogPost blogPost) {
        return blogPostRepository.save(blogPost);
    }

    @Override
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        BlogPost existingPost = getPostById(id);
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setSnippet(updatedPost.getSnippet());
        existingPost.setImageUrl(updatedPost.getImageUrl());
        existingPost.setLink(updatedPost.getLink());
        return blogPostRepository.save(existingPost);
    }

    @Override
    public void deletePost(Long id) {
        blogPostRepository.deleteById(id);
    }

}
