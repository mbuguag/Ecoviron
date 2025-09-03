package com.example.ecoviron.controller;

import com.example.ecoviron.dto.BlogPostDto;
import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.mapper.BlogPostMapper;
import com.example.ecoviron.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/public-blogs")


public class PublicBlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogPostMapper blogPostMapper;

    @GetMapping
    public ResponseEntity<List<BlogPostDto>> getAllPosts() {
        List<BlogPostDto> posts = blogService.getAllPosts().stream()
                .map(blogPostMapper::toDto)
                .toList();
        return ResponseEntity.ok(posts);
    }


    @GetMapping("/public")
    public ResponseEntity<?> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String tag
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var posts = (tag == null || tag.isEmpty())
                ? blogService.getPublishedPosts(pageable)
                : blogService.getPostsByTag(tag, pageable);

        var postDtos = posts.map(blogPostMapper::toDto);
        return ResponseEntity.ok(postDtos);
    }


    @GetMapping("/public/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var results = blogService.searchPosts(query, pageable);
        var dtoResults = results.map(blogPostMapper::toDto);
        return ResponseEntity.ok(dtoResults);
    }


    @GetMapping("/public/{id}")
    public ResponseEntity<BlogPostDto> getPublishedPostById(@PathVariable Long id) {
        BlogPost post = blogService.getPublishedPostById(id);
        return ResponseEntity.ok(blogPostMapper.toDto(post));
    }



    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDto> getPostById(@PathVariable Long id) {
        BlogPost post = blogService.getPostById(id);
        return ResponseEntity.ok(blogPostMapper.toDto(post));
    }

    @PutMapping("/public/{id}/views")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        blogService.incrementViewCount(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags")
    public ResponseEntity<Set<String>> getPublishedTags() {
        Set<String> tags = blogService.getAllUniqueTags();
        return ResponseEntity.ok(tags);
    }

}