package com.example.ecoviron.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class CartItemDto {
    private Long id;
    private int quantity;
   private ProductDto product;

}
