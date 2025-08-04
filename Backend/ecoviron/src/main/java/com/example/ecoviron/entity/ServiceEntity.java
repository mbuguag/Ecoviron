package com.example.ecoviron.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "services")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;
    private String link;
}
