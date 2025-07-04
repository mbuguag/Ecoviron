package com.example.ecoviron.service;

import com.example.ecoviron.dto.WishListItemDto;

import java.util.List;

public interface WishListService {
    List<WishListItemDto> getUserWishlist(String username);
    void addToWishList(String username, Long productId);
    void removeFromWishList(String username, Long productId);
}
