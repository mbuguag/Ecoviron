package com.example.ecoviron.mapper;

import com.example.ecoviron.dto.BlogPostDto;
import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.repository.UserRepository;
import org.springframework.stereotype.Component;


import java.util.Optional;

@Component
public class BlogPostMapper {


    private  final UserRepository userRepository;

    public BlogPostMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


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
        dto.setStatus(post.getStatus());

        // Map author information with exact field name matching
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
        if (dto == null) return null;

        BlogPost post = new BlogPost();
        mapDtoToEntity(dto, post);
        return post;
    }

    public void mapDtoToEntity(BlogPostDto dto, BlogPost post) {
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
            post.setStatus(dto.getStatus());
        }

        if (dto.getAuthor() != null && dto.getAuthor().getId() != null) {
            userRepository.findById(dto.getAuthor().getId()).ifPresent(post::setAuthor);
        }
    }

}