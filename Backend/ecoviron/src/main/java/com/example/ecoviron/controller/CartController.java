package com.example.ecoviron.controller;

import com.example.ecoviron.dto.AddToCartRequest;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://127.0.0.1:5500")

public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService; // Assumes you have a way to get current user


    // Example: Get user from security context (replace this method with actual logic)
    private User getCurrentUser() {
        return userService.getCurrentUser(); // You need to implement this in UserService
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = getCurrentUser();
        Cart cart = cartService.getCartByUser(user);
        return ResponseEntity.ok(cart);
    }


    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        if (request.productId == null || request.quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        User user = getCurrentUser();
        Cart updatedCart = cartService.addItemToCart(user, request.productId, request.quantity);
        return ResponseEntity.ok(updatedCart);
    }


    @PutMapping("/update")
    public ResponseEntity<Cart> updateQuantity(@RequestParam Long itemId, @RequestParam int quantity) {
        User user = getCurrentUser();
        Cart updatedCart = cartService.updateItemQuantity(user, itemId, quantity);
        return ResponseEntity.ok(updatedCart);
    }


    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        User user = getCurrentUser();
        cartService.removeItemFromCart(user, itemId);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        User user = getCurrentUser();
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}
