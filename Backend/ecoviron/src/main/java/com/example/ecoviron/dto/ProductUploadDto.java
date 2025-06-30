package com.example.ecoviron.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductUploadDto {
    private String name;
    private String description;
    private double price;
    private int stock;
    private boolean featured;
    private Long categoryId;
    private MultipartFile image;
}
