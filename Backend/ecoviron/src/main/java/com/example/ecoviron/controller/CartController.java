package com.example.ecoviron.controller;

import com.example.ecoviron.dto.AddToCartRequest;
import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.UserService;
import com.example.ecoviron.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    private User getCurrentUser() {
        return userService.getCurrentUser();
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart() {
        return ResponseEntity.ok(cartService.getCartByUser(getCurrentUser()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponseDto> addToCart(@Valid @RequestBody AddToCartRequest request) {
        if (request.productId == null || request.quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(
                cartService.addItemToCart(getCurrentUser(), request.productId, request.quantity)
        );
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponseDto> updateQuantity(
            @RequestParam Long itemId,
            @RequestParam int quantity
    ) {
        return ResponseEntity.ok(
                cartService.updateItemQuantity(getCurrentUser(), itemId, quantity)
        );
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        cartService.removeItemFromCart(getCurrentUser(), itemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(getCurrentUser());
        return ResponseEntity.ok().build();
    }
}
