package com.example.ecoviron.service;

import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.entity.BlogPost.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

public interface BlogService {
    // Paginated methods
    Page<BlogPost> getPostsByStatus(String status, Pageable pageable);
    Page<BlogPost> getAllPosts(Pageable pageable);
    Page<BlogPost> getPublishedPosts(Pageable pageable);

    // Legacy list-based methods (marked deprecated)
    @Deprecated
    List<BlogPost> getAllPosts();
    @Deprecated
    List<BlogPost> getPostsByStatus(PostStatus status);

    // Single post operations
    BlogPost getPostById(Long id);
    BlogPost getPostBySlug(String slug);

    // CRUD operations
    BlogPost createPost(BlogPost blogPost);
    BlogPost updatePost(Long id, BlogPost updatedPost);

    // Media handling
    BlogPost uploadImage(Long id, MultipartFile file);

    // Status management
    BlogPost publishPost(Long id);
    void deletePost(Long id);

    // Search and discovery
    Page<BlogPost> searchPosts(String query, Pageable pageable);
    Page<BlogPost> getPostsByTag(String tag, Pageable pageable);
    Set<String> getAllUniqueTags();

    // Analytics
    Integer incrementViewCount(Long id);

    List<String> getAllTags();

    void updatePostStatus(Long postId, BlogPost.PostStatus status);

    BlogPost getPublishedPostById(Long id);


}