package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.OrderRequestDto;
import com.example.ecoviron.entity.*;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Override
    public Order save(OrderRequestDto orderDto, User user) {
        List<OrderItem> items = orderDto.getItems().stream().map(dto -> {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

            return OrderItem.builder()
                    .product(product)
                    .quantity(dto.getQuantity())
                    .price(dto.getPrice())
                    .build();
        }).collect(Collectors.toList());

        Order order = Order.builder()
                .user(user)
                .items(items)
                .totalAmount(orderDto.getTotalAmount())
                .status(OrderStatus.PENDING)
                .shippingAddress(orderDto.getCustomerDetails().getShippingAddress())
                .orderDate(LocalDateTime.now())
                .orderReference(UUID.randomUUID().toString())
                .build();

        items.forEach(item -> item.setOrder(order));
        return orderRepository.save(order);
    }

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
                .orderReference(UUID.randomUUID().toString())
                .status(OrderStatus.PENDING)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);

        return savedOrder;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }
}
