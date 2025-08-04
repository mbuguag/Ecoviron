package com.example.ecoviron.dto;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ServiceRequest {
    private String title;
    private String description;
    private String imageUrl;
    private String link;
}
