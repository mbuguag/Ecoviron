package com.example.ecoviron.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Data
public class CartResponseDto {
    private List<CartItemDto> items;
    private double totalPrice;
    private int totalQuantity;

}
