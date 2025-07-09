package com.example.ecoviron.mapper;

import com.example.ecoviron.dto.CartItemDto;
import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.dto.ProductDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.Product;

import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartResponseDto toDto(Cart cart) {
        CartResponseDto dto = new CartResponseDto();

        List<CartItemDto> itemDtos = cart.getItems().stream().map(item -> {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setQuantity(item.getQuantity());

            Product product = item.getProduct();
            ProductDto productDto = new ProductDto();
            productDto.setId(product.getId());
            productDto.setName(product.getName());
            productDto.setPrice(product.getPrice());
            productDto.setImageUrl(product.getImageUrl());

            itemDto.setProduct(productDto);
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);

        dto.setTotalQuantity(
                itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum()
        );

        dto.setTotalPrice(
                itemDtos.stream()
                        .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                        .sum()
        );

        return dto;
    }
}
