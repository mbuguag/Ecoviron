package com.example.ecoviron.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {
    private String title;
    private String description;
    private String imageUrl;
    private String link;
}
