package com.example.ecoviron.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class CartDto {
    private List<CartItemDto> items;
    private double totalPrice;
    private int totalQuantity;

}
