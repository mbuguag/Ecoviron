package com.example.ecoviron.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String title;
    private String snippet;
    private String imageUrl;
    private String link;
}
