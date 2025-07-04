package com.example.ecoviron.controller;

import com.example.ecoviron.dto.AddToCartRequest;
import com.example.ecoviron.dto.CartResponseDto;
import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.mapper.CartMapper;
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
    private UserService userService;


    private User getCurrentUser() {
        return userService.getCurrentUser(); // You need to implement this in UserService
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart() {
        User user = getCurrentUser();
        Cart cart = cartService.getCartByUser(user);
        CartResponseDto dto = CartMapper.toDto(cart);
        return ResponseEntity.ok(dto);
    }



    @PostMapping("/add")
    public ResponseEntity<CartResponseDto> addToCart(@RequestBody AddToCartRequest request) {
        if (request.productId == null || request.quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        User user = getCurrentUser();
        Cart updatedCart = cartService.addItemToCart(user, request.productId, request.quantity);

        CartResponseDto dto = CartMapper.toDto(updatedCart);
        return ResponseEntity.ok(dto);
    }



    @PutMapping("/update")
    public ResponseEntity<CartResponseDto> updateQuantity(@RequestParam Long itemId, @RequestParam int quantity) {
        User user = getCurrentUser();
        Cart updatedCart = cartService.updateItemQuantity(user, itemId, quantity);
        CartResponseDto dto = CartMapper.toDto(updatedCart);
        return ResponseEntity.ok(dto);
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
