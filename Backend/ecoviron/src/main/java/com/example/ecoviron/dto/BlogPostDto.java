package com.example.ecoviron.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;
import com.example.ecoviron.entity.BlogPost.PostStatus;



@Data
public class BlogPostDto {

    private Long id;

    @NotBlank
    @Size(min = 5, max = 100)
    private String title;

    @Pattern(regexp = "^[a-z0-9-]+$")
    private String slug;

    @NotBlank
    @Size(min = 10, max = 500)
    private String snippet;
    private String imageUrl;
    private String imageAlt;
    private String imageCaption;

    @NotBlank
    private String content;
    private String metaDescription;
    private String keywords;
    private String link;
    private Set<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private PostStatus status;
    private AuthorDto author;

    @Data
    public static class AuthorDto {
        private Long id;
        private String fullName;
        private String email;
        private String profilePicture;
    }
}