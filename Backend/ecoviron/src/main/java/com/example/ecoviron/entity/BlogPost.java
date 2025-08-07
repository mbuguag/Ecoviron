package com.example.ecoviron.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "blog_posts")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BlogPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @Size(min = 5, max = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String snippet;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_alt")
    private String imageAlt;

    @Column(name = "image_caption")
    private String imageCaption;

    @Column(unique = true)
    private String slug;  // For SEO-friendly URLs

    @Column(columnDefinition = "TEXT", nullable = false)
    @Size(min = 10)
    private String content;

    @Column(name = "meta_description", length = 300)
    private String metaDescription;

    @Column(name = "keywords")
    private String keywords;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;


    @Enumerated(EnumType.STRING)
    private PostStatus status = PostStatus.DRAFT;


    @Column
    private String link;

    @Column(name = "view_count", columnDefinition = "integer default 0")
    private Integer viewCount = 0;

    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    public enum PostStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }

}
