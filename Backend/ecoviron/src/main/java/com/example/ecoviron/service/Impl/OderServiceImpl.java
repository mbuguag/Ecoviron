package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Cart;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderItem;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OderServiceImpl implements OrderService {

    @Autowired
    private final OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Override
    public Order placeOrder(User user){
        Cart cart = cartService.getCartByUser(user);
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getProduct().getPrice())
                        .build())
                .collect(Collectors.toList());

        double totalAmount = orderItems.stream()
                .mapToDouble(item -> item.getQuantity() * item.getPrice())
                .sum();

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .items(orderItems)
                .totalAmount(totalAmount)
                .build();

        // Assign order to each item
        orderItems.forEach(item -> item.setOrder(order));

        // Save order and clear cart
        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);

        return savedOrder;
    }
}
