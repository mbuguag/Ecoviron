package com.example.ecoviron.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class ProductDto {
    private Long id;
    private String name;
    private double price;
    private String imageUrl;

}
