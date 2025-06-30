package com.example.ecoviron.dto;

import lombok.Data;

@Data
public class BlogPostDto {
    private Long id;
    private String title;
    private String snippet;
    private String imageUrl;
    private String link;
    private String content;

}
