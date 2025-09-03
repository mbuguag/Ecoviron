package com.example.ecoviron.controller;

import com.example.ecoviron.dto.WishListItemDto;
import com.example.ecoviron.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishListService wishListService;

    @GetMapping
    public List<WishListItemDto> getWishlist(@AuthenticationPrincipal UserDetails user) {
        return wishListService.getUserWishlist(user.getUsername());
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> add(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        wishListService.addToWishList(user.getUsername(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> remove(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        wishListService.removeFromWishList(user.getUsername(), productId);
        return ResponseEntity.ok().build();
    }
}
