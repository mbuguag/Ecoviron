package com.example.ecoviron.mapper;

import com.example.ecoviron.dto.CartItemDto;
import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.dto.ProductDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.CartItem;
import com.example.ecoviron.entity.Product;

import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartResponseDto toDto(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemDto> itemDtos = cart.getItems().stream().map(CartMapper::mapCartItem).collect(Collectors.toList());

        double totalPrice = itemDtos.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        int totalQuantity = itemDtos.stream()
                .mapToInt(CartItemDto::getQuantity)
                .sum();

        CartResponseDto dto = new CartResponseDto();
        dto.setItems(itemDtos);
        dto.setTotalPrice(totalPrice);
        dto.setTotalQuantity(totalQuantity);

        return dto;
    }

    private static CartItemDto mapCartItem(CartItem item) {
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
    }
}
