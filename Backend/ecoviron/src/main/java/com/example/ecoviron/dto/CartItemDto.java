package com.example.ecoviron.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CartItemDto {
    private Long id;
    private int quantity;
   private ProductDto product;

}
