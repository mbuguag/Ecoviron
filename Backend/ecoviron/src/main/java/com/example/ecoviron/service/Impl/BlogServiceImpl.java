package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.entity.BlogPost.PostStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.exception.ResourceNotFoundException;
import com.example.ecoviron.repository.BlogPostRepository;
import com.example.ecoviron.repository.UserRepository;
import com.example.ecoviron.service.BlogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    @Autowired
    public BlogServiceImpl(BlogPostRepository blogPostRepository, UserRepository userRepository) {
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
    }

    // Paginated methods for controller
    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPostsByStatus(String status, Pageable pageable) {
        PostStatus postStatus = PostStatus.valueOf(status.toUpperCase());
        return blogPostRepository.findByStatus(postStatus, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getAllPosts(Pageable pageable) {
        return blogPostRepository.findAll(pageable);
    }

    // Legacy methods (keep for backward compatibility)
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

    // Published posts with pagination
    @Override
    @Transactional(readOnly = true)
    public Page<BlogPost> getPublishedPosts(Pageable pageable) {
        return blogPostRepository.findByStatus(PostStatus.PUBLISHED, pageable);
    }

    // Single post operations
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
    public List<String> getAllTags() {
        return blogPostRepository.findAllTags();
    }

    @Override
    public BlogPost getPublishedPostById(Long id) {
        return blogPostRepository.findByIdAndStatus(id, PostStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found or not published"));
    }


    @Override
    @Transactional
    public void updatePostStatus(Long postId, BlogPost.PostStatus status) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(status);

        if (status == BlogPost.PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }

        blogPostRepository.save(post);
    }

    // CRUD operations
    @Override
    @Transactional
    public BlogPost createPost(BlogPost blogPost) {
        validatePostForCreation(blogPost);

        if (blogPost.getAuthor() != null && blogPost.getAuthor().getId() != null) {
            Long authorId = blogPost.getAuthor().getId();
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Author not found with ID: " + authorId));
            blogPost.setAuthor(author);
        } else {
            throw new IllegalArgumentException("Author is required for blog post creation");
        }

        return blogPostRepository.save(blogPost);
    }


    @Override
    @Transactional
    public BlogPost updatePost(Long id, BlogPost updatedPost) {
        BlogPost existingPost = getPostById(id);
        validatePostForUpdate(existingPost, updatedPost);
        return blogPostRepository.save(updatedPost);
    }

    @Override
    @Transactional
    public BlogPost uploadImage(Long id, MultipartFile file) {
        validateImageFile(file);
        BlogPost post = getPostById(id);
        String imageUrl = storeImageAndGetUrl(file);
        post.setImageUrl(imageUrl);
        return blogPostRepository.save(post);
    }

    // Status management
    @Override
    @Transactional
    public BlogPost publishPost(Long id) {
        BlogPost post = getPostById(id);
        post.setStatus(PostStatus.PUBLISHED);
        post.setPublishedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        BlogPost post = getPostById(id);
        post.setStatus(PostStatus.ARCHIVED);
        blogPostRepository.save(post);
    }

    // Search and filtering
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

    // Analytics
    @Override
    @Transactional
    public Integer incrementViewCount(Long id) {
        blogPostRepository.incrementViewCount(id);
        // Fetch the new view count to return
        return blogPostRepository.findById(id)
                .map(BlogPost::getViewCount)
                .orElseThrow(() -> new EntityNotFoundException("Blog post not found"));
    }





    // Helper methods
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
        updatedPost.setId(existingPost.getId());
        updatedPost.setCreatedAt(existingPost.getCreatedAt());
        updatedPost.setAuthor(existingPost.getAuthor());
        updatedPost.setViewCount(existingPost.getViewCount());

        if (!existingPost.getSlug().equals(updatedPost.getSlug()) &&
                blogPostRepository.existsBySlug(updatedPost.getSlug())) {
            throw new IllegalArgumentException("Slug already exists: " + updatedPost.getSlug());
        }

        if (updatedPost.getStatus() != existingPost.getStatus()
                && updatedPost.getStatus() == PostStatus.PUBLISHED) {
            updatedPost.setPublishedAt(LocalDateTime.now());
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
        // Implement your actual image storage logic here
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