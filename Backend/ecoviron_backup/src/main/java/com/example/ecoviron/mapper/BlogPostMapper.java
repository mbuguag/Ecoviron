package com.example.ecoviron.mapper;

import com.example.ecoviron.dto.BlogPostDto;
import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.entity.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class BlogPostMapper {

    public BlogPostDto toDto(BlogPost post) {
        if (post == null) {
            return null;
        }

        BlogPostDto dto = new BlogPostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setSnippet(post.getSnippet());
        dto.setImageUrl(post.getImageUrl());
        dto.setImageAlt(post.getImageAlt());
        dto.setImageCaption(post.getImageCaption());
        dto.setContent(post.getContent());
        dto.setMetaDescription(post.getMetaDescription());
        dto.setKeywords(post.getKeywords());
        dto.setLink(post.getLink());
        dto.setTags(post.getTags());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setPublishedAt(post.getPublishedAt());
        dto.setStatus(post.getStatus() != null ? post.getStatus().name() : null);

        Optional.ofNullable(post.getAuthor())
                .ifPresent(author -> {
                    BlogPostDto.AuthorDto authorDto = new BlogPostDto.AuthorDto();
                    authorDto.setId(author.getId());
                    authorDto.setFullName(author.getFullName());
                    authorDto.setEmail(author.getEmail());
                    authorDto.setProfilePicture(author.getProfilePicture());
                    dto.setAuthor(authorDto);
                });

        return dto;
    }

    public BlogPost toEntity(BlogPostDto dto) {
        if (dto == null) {
            return null;
        }

        BlogPost post = new BlogPost();
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setSnippet(dto.getSnippet());
        post.setImageUrl(dto.getImageUrl());
        post.setImageAlt(dto.getImageAlt());
        post.setImageCaption(dto.getImageCaption());
        post.setContent(dto.getContent());
        post.setMetaDescription(dto.getMetaDescription());
        post.setKeywords(dto.getKeywords());
        post.setLink(dto.getLink());
        post.setTags(dto.getTags());

        if (dto.getStatus() != null) {
            try {
                post.setStatus(BlogPost.PostStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                post.setStatus(null); // or default to DRAFT
            }
        }

        return post;
    }
}
