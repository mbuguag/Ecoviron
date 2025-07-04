package com.example.ecoviron.mapper;

import com.example.ecoviron.dto.CartItemDto;
import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.CartItem;
import com.example.ecoviron.entity.Product;

import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartResponseDto toDto(Cart cart) {
        CartResponseDto dto = new CartResponseDto();

        List<CartItemDto> itemDtos = cart.getItems().stream().map(item -> {
            CartItemDto itemDto = new CartItemDto();
            Product product = item.getProduct();

            itemDto.setId(item.getId());
            itemDto.setProductId(product.getId());
            itemDto.setProductName(product.getName());
            itemDto.setProductImage(product.getImageUrl());
            itemDto.setPrice(product.getPrice());
            itemDto.setQuantity(item.getQuantity());

            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        dto.setTotalQuantity(itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum());
        dto.setTotalPrice(itemDtos.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum());

        return dto;
    }
}
