package com.example.ecoviron.controller;

import com.example.ecoviron.dto.BlogPostDto;
import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin
public class BlogPostController {

    private final BlogService blogService;

    @Autowired
    public BlogPostController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ResponseEntity<List<BlogPostDto>> getAllBlogs() {
        List<BlogPostDto> blogs = blogService.getAllPosts().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDto> getBlogById(@PathVariable Long id) {
        BlogPost blogPost = blogService.getPostById(id);
        return ResponseEntity.ok(convertToDto(blogPost));
    }

    @PostMapping
    public ResponseEntity<BlogPostDto> createBlog(@RequestBody BlogPostDto dto) {
        BlogPost post = blogService.createPost(convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostDto> updateBlog(@PathVariable Long id, @RequestBody BlogPostDto dto) {
        BlogPost post = blogService.updatePost(id, convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // Helper methods for conversion
    private BlogPostDto convertToDto(BlogPost post) {
        BlogPostDto dto = new BlogPostDto();
        dto.setTitle(post.getTitle());
        dto.setSnippet(post.getSnippet());
        dto.setImageUrl(post.getImageUrl());
        dto.setLink(post.getLink());
        return dto;
    }

    private BlogPost convertToEntity(BlogPostDto dto) {
        BlogPost post = new BlogPost();
        post.setTitle(dto.getTitle());
        post.setSnippet(dto.getSnippet());
        post.setImageUrl(dto.getImageUrl());
        post.setLink(dto.getLink());
        return post;
    }
}
