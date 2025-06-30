package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.*;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    /**
     * Places an order based on current user's cart
     */
    @Override
    public Order placeOrder(User user) {
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
                .status(OrderStatus.PENDING)
                .orderReference(generateOrderReference())
                .build();

        orderItems.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);
        return savedOrder;
    }

    /**
     * Saves an order from direct request (e.g., frontend checkout form)
     */
    @Override
    public Order saveOrder(Order order, User user) {
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderReference(generateOrderReference());

        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

<<<<<<< HEAD
    private String generateOrderReference() {
        return "ORD-" + System.currentTimeMillis();
    }
=======
    @Override
    public Order saveOrder(Order order, User user) {
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING); // default status

        // if needed: assign each orderItem the parent order
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }

        // generate orderReference if your entity requires one
        String reference = "ORD-" + System.currentTimeMillis();
        order.setOrderReference(reference);

        return orderRepository.save(order);
    }

>>>>>>> 0adeff7a2bbf24d66d8ba480a90d3600e36c7eeb
}
