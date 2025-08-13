package com.example.ecoviron.controller;

import com.example.ecoviron.dto.BlogPostDto;
import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.mapper.BlogPostMapper;
import com.example.ecoviron.service.BlogService;
import com.example.ecoviron.service.StorageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin-blogs")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class AdminBlogController {

    private static final Logger log = LoggerFactory.getLogger(AdminBlogController.class);

    private final BlogService blogService;
    private final BlogPostMapper blogPostMapper;
    private final StorageService storageService;

    @Autowired
    public AdminBlogController(BlogService blogService,
                               BlogPostMapper blogPostMapper,
                               StorageService storageService) {
        this.blogService = blogService;
        this.blogPostMapper = blogPostMapper;
        this.storageService = storageService;
    }

    @GetMapping
    public ResponseEntity<Page<BlogPostDto>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BlogPost> postsPage = (status != null && !status.isEmpty())
                ? blogService.getPostsByStatus(status, pageable)
                : blogService.getAllPosts(pageable);

        return ResponseEntity.ok(postsPage.map(blogPostMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDto> getPostById(@PathVariable Long id) {
        BlogPost post = blogService.getPostById(id);
        return ResponseEntity.ok(blogPostMapper.toDto(post));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogPostDto> createPost(
            @RequestPart("post") @Valid BlogPostDto postDto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        log.info("Creating post with title: {}", postDto.getTitle());
        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = storageService.saveBlogImage(imageFile);
                postDto.setImageUrl(imageUrl);
                log.info("Image uploaded: {}", imageFile.getOriginalFilename());
            }

            BlogPost blogPost = blogPostMapper.toEntity(postDto);
            BlogPost saved = blogService.createPost(blogPost);
            return ResponseEntity.ok(blogPostMapper.toDto(saved));
        } catch (Exception e) {
            log.error("Error creating post", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogPostDto> updatePost(
            @PathVariable Long id,
            @RequestPart("post") @Valid BlogPostDto postDto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = storageService.saveBlogImage(imageFile);
                postDto.setImageUrl(imageUrl);
            }

            BlogPost updated = blogService.updatePost(id, blogPostMapper.toEntity(postDto));
            return ResponseEntity.ok(blogPostMapper.toDto(updated));
        } catch (Exception e) {
            log.error("Error updating post with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updatePostStatus(
            @PathVariable Long id,
            @RequestParam BlogPost.PostStatus status) {
        blogService.updatePostStatus(id, status);
        return ResponseEntity.ok("Status updated to " + status.name());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
