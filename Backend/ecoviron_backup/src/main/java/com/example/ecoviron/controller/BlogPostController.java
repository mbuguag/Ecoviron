//package com.example.ecoviron.controller;
//
//import com.example.ecoviron.dto.BlogPostDto;
//import com.example.ecoviron.dto.PagedResponse;
//import com.example.ecoviron.entity.BlogPost;
//import com.example.ecoviron.mapper.BlogPostMapper;
//import com.example.ecoviron.service.BlogService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.time.Instant;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@RestController
//@RequestMapping("/api/blogs")
//@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
//public class BlogPostController {
//
//    @Autowired
//    private  BlogService blogService;
//
//    @Autowired
//    private BlogPostMapper blogPostMapper;
//
//    @Autowired
//    public BlogPostController(BlogService blogService, BlogPostMapper blogPostMapper) {
//        this.blogService = blogService;
//        this.blogPostMapper = blogPostMapper;
//    }
//
//    @GetMapping("/public")
//    public ResponseEntity<PagedResponse<BlogPostDto>> getPublishedBlogs(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "6") int size,
//            @RequestParam(required = false) String tag,
//            @RequestParam(required = false) String query) {
//
//        Page<BlogPost> blogPage = getFilteredBlogPage(page, size, tag, query);
//        return ResponseEntity.ok(createPagedResponse(blogPage));
//    }
//
//    @GetMapping("/public/slug/{slug}")
//    public ResponseEntity<BlogPostDto> getBlogBySlug(@PathVariable String slug) {
//        return ResponseEntity.ok(blogPostMapper.toDto(blogService.getPostBySlug(slug)));
//    }
//
//    @GetMapping
//    public ResponseEntity<List<BlogPostDto>> getAllBlogs(
//            @RequestParam(required = false) String status) {
//        List<BlogPost> blogs = status != null ?
//                blogService.getPostsByStatus(BlogPost.PostStatus.valueOf(status.toUpperCase())) :
//                blogService.getAllPosts();
//        return ResponseEntity.ok(mapToDtoList(blogs));
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<BlogPostDto> getBlogById(@PathVariable Long id) {
//        return ResponseEntity.ok(blogPostMapper.toDto(blogService.getPostById(id)));
//    }
//
//    @PreAuthorize("hasRole('ADMIN')")
//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<BlogPostDto> createBlog(
//            @RequestParam("title") String title,
//            @RequestParam("slug") String slug,
//            @RequestParam("status") String status,
//            @RequestParam("snippet") String snippet,
//            @RequestParam("content") String content,
//            @RequestParam(value = "metaDescription", required = false) String metaDescription,
//            @RequestParam(value = "tags", required = false) List<String> tags,
//            @RequestParam(value = "publishedAt", required = false) String publishedAt,
//            @RequestParam(value = "image", required = false) MultipartFile image
//    ) {
//        BlogPost post = new BlogPost();
//        post.setTitle(title);
//        post.setSlug(slug);
//        post.setStatus(BlogPost.PostStatus.valueOf(status));
//        post.setSnippet(snippet);
//        post.setContent(content);
//        post.setMetaDescription(metaDescription);
//        post.setTags(tags);
//        post.setPublishedAt(publishedAt != null ? Instant.parse(publishedAt) : null);
//
//        BlogPost saved = blogService.createPost(post, image);
//        return ResponseEntity.ok(blogPostMapper.toDto(saved));
//    }
//
//
//    @PreAuthorize("hasRole('ADMIN')")
//    @PostMapping("/{id}/image")
//    public ResponseEntity<BlogPostDto> uploadBlogImage(
//            @PathVariable Long id,
//            @RequestParam("file") MultipartFile file) {
//        return ResponseEntity.ok(blogPostMapper.toDto(blogService.uploadImage(id, file)));
//    }
//
//    @PreAuthorize("hasRole('ADMIN')")
//    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<BlogPostDto> updateBlog(
//            @PathVariable Long id,
//            @RequestParam("title") String title,
//            @RequestParam("slug") String slug,
//            @RequestParam("status") String status,
//            @RequestParam("snippet") String snippet,
//            @RequestParam("content") String content,
//            @RequestParam(value = "metaDescription", required = false) String metaDescription,
//            @RequestParam(value = "tags", required = false) List<String> tags,
//            @RequestParam(value = "publishedAt", required = false) String publishedAt,
//            @RequestParam(value = "image", required = false) MultipartFile image
//    ) {
//        BlogPost post = new BlogPost();
//        post.setId(id);
//        post.setTitle(title);
//        post.setSlug(slug);
//        post.setStatus(BlogPost.PostStatus.valueOf(status));
//        post.setSnippet(snippet);
//        post.setContent(content);
//        post.setMetaDescription(metaDescription);
//        post.setTags(tags);
//        post.setPublishedAt(publishedAt != null ? Instant.parse(publishedAt) : null);
//
//        BlogPost updated = blogService.updatePost(id, post, image);
//        return ResponseEntity.ok(blogPostMapper.toDto(updated));
//    }
//
//
//    @PutMapping("/{id}/publish")
//    public ResponseEntity<BlogPostDto> publishBlog(@PathVariable Long id) {
//        return ResponseEntity.ok(blogPostMapper.toDto(blogService.publishPost(id)));
//    }
//
//    @PreAuthorize("hasRole('ADMIN')")
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
//        blogService.deletePost(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    // Helper methods
//    private Page<BlogPost> getFilteredBlogPage(int page, int size, String tag, String query) {
//        if (tag != null && !tag.isEmpty()) {
//            return blogService.getPostsByTag(tag, PageRequest.of(page, size));
//        } else if (query != null && !query.isEmpty()) {
//            return blogService.searchPosts(query, PageRequest.of(page, size));
//        }
//        return blogService.getPublishedPosts(PageRequest.of(page, size));
//    }
//
//    private PagedResponse<BlogPostDto> createPagedResponse(Page<BlogPost> blogPage) {
//        return new PagedResponse<>(
//                mapToDtoList(blogPage.getContent()),
//                blogPage.getNumber(),
//                blogPage.getSize(),
//                blogPage.getTotalElements(),
//                blogPage.getTotalPages(),
//                blogPage.isLast()
//        );
//    }
//
//    private List<BlogPostDto> mapToDtoList(List<BlogPost> posts) {
//        return posts.stream()
//                .map(blogPostMapper::toDto)
//                .collect(Collectors.toList());
//    }
//}