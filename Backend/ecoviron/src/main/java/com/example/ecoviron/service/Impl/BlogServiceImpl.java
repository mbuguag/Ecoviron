package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.entity.BlogPost.PostStatus;
import com.example.ecoviron.exception.ResourceNotFoundException;
import com.example.ecoviron.repository.BlogPostRepository;
import com.example.ecoviron.service.BlogService;
import com.example.ecoviron.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogPostRepository blogPostRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public BlogServiceImpl(BlogPostRepository blogPostRepository, FileStorageService fileStorageService) {
        this.blogPostRepository = blogPostRepository;
        this.fileStorageService = fileStorageService;
    }

    // --- Paginated fetch methods ---

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getAllPosts(Pageable pageable) {
        return blogPostRepository.findAllWithTags(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPostsByStatus(String status, Pageable pageable) {
        PostStatus postStatus = parseStatus(status);
        return blogPostRepository.findByStatusWithTags(postStatus, pageable);
    }



    @Override
    @Transactional(readOnly = true)
    @Deprecated
    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @Deprecated
    public List<BlogPost> getPostsByStatus(PostStatus status) {
        return blogPostRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPublishedPosts(Pageable pageable) {
        return blogPostRepository.findByStatus(PostStatus.PUBLISHED, pageable);
    }

    // --- Single post fetchers ---

    @Override
    @Transactional(readOnly = true)
    public BlogPost getPostById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public BlogPost getPostBySlug(String slug) {
        return blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found with slug: " + slug));
    }

    @Override
    @Transactional(readOnly = true)
    public BlogPost getPublishedPostById(Long id) {
        return blogPostRepository.findByIdAndStatus(id, PostStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published post not found with ID: " + id));
    }

    // --- CRUD and Status ---

    @Override
    @Transactional
    public BlogPost createPost(BlogPost blogPost) {
        validatePostForCreation(blogPost);
        blogPost.setCreatedAt(LocalDateTime.now());
        blogPost.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(blogPost);
    }

    @Override
    @Transactional
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        BlogPost existingPost = getPostById(id);
        validatePostForUpdate(existingPost, updatedPost);

        // Update allowed fields only
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setSlug(updatedPost.getSlug());
        existingPost.setSnippet(updatedPost.getSnippet());
        existingPost.setImageUrl(updatedPost.getImageUrl());
        existingPost.setImageAlt(updatedPost.getImageAlt());
        existingPost.setImageCaption(updatedPost.getImageCaption());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setMetaDescription(updatedPost.getMetaDescription());
        existingPost.setKeywords(updatedPost.getKeywords());
        existingPost.setLink(updatedPost.getLink());
        existingPost.setTags(updatedPost.getTags());
        existingPost.setStatus(updatedPost.getStatus());

        // Set publishedAt if publishing newly
        if (existingPost.getStatus() == PostStatus.PUBLISHED && existingPost.getPublishedAt() == null) {
            existingPost.setPublishedAt(LocalDateTime.now());
        }

        existingPost.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(existingPost);
    }

    @Override
    @Transactional
    public BlogPost uploadImage(Long id, MultipartFile file) {
        validateImageFile(file);
        BlogPost post = getPostById(id);

        String imageUrl = fileStorageService.uploadBlogImage(file); // no try/catch
        post.setImageUrl(imageUrl);
        post.setUpdatedAt(LocalDateTime.now());

        return blogPostRepository.save(post);
    }

    // Improved slug generator
    private String generateSlug(String title) {
        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        String slug = baseSlug;
        int counter = 1;
        while (blogPostRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }





    @Override
    @Transactional
    public void updatePostStatus(Long postId, PostStatus status) {
        BlogPost post = getPostById(postId);
        post.setStatus(status);
        if (status == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
        blogPostRepository.save(post);
    }

    @Override
    @Transactional
    public BlogPost publishPost(Long id) {
        BlogPost post = getPostById(id);
        post.setStatus(PostStatus.PUBLISHED);
        if (post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        BlogPost post = getPostById(id);
        post.setStatus(PostStatus.ARCHIVED);
        post.setUpdatedAt(LocalDateTime.now());
        blogPostRepository.save(post);
    }

    // --- Search and Tags ---

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> searchPosts(String query, Pageable pageable) {
        return blogPostRepository.searchPublishedPosts(query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPostsByTag(String tag, Pageable pageable) {
        return blogPostRepository.findByPublishedTag(tag, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> getAllUniqueTags() {
        return blogPostRepository.findAllPublishedUniqueTags();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTags() {
        return blogPostRepository.findAllTags();
    }

    // --- Analytics ---

    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        blogPostRepository.incrementViewCount(id);
    }

    // --- Helper methods ---

    private PostStatus parseStatus(String status) {
        try {
            return PostStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid post status: " + status);
        }
    }

    private void validatePostForCreation(BlogPost blogPost) {
        if (blogPost.getTitle() == null || blogPost.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (blogPost.getStatus() == null) {
            blogPost.setStatus(PostStatus.DRAFT);
        }

        if (blogPost.getSlug() == null || blogPost.getSlug().isEmpty()) {
            blogPost.setSlug(generateSlug(blogPost.getTitle()));
        }

        if (blogPostRepository.existsBySlug(blogPost.getSlug())) {
            throw new IllegalArgumentException("Slug already exists: " + blogPost.getSlug());
        }

        if (blogPost.getViewCount() == null) {
            blogPost.setViewCount(0);
        }
    }

    private void validatePostForUpdate(BlogPost existingPost, BlogPost updatedPost) {
        if (!existingPost.getSlug().equals(updatedPost.getSlug()) &&
                blogPostRepository.existsBySlug(updatedPost.getSlug())) {
            throw new IllegalArgumentException("Slug already exists: " + updatedPost.getSlug());
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }

    private String storeImageAndGetUrl(MultipartFile file) {
        // Replace this with your real storage logic
        return "https://your-storage.com/" + file.getOriginalFilename();
    }

    private String generateSlug(String title) {
        if (title == null) {
            throw new IllegalArgumentException("Title cannot be null for slug generation");
        }
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
