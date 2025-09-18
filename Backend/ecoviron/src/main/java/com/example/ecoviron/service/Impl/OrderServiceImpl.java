package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.*;
import com.example.ecoviron.entity.*;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.service.CartService;
import com.example.ecoviron.service.EmailService;
import com.example.ecoviron.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final EmailService emailService;

    @Override
    public Order placeOrder(User user) {
        log.info("Placing order from cart for user: {}", user.getEmail());

        Cart cart = cartService.getCartEntityByUser(user);

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
                .orderReference(generateOrderReference())
                .status(OrderStatus.PENDING)
                .build();

        orderItems.forEach(item -> item.setOrder(order));

        log.info("Saving cart-based order...");
        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(user);

        try {
            emailService.sendOrderNotification(savedOrder, user);
            emailService.sendCustomerOrderReceiptHtml(savedOrder, user);
        } catch (Exception e) {
            log.warn("Email notifications failed: {}", e.getMessage());
        }

        return savedOrder;
    }

    @Transactional
    @Override
    public Order save(OrderRequestDto orderDto, User user) {
        log.info("Saving manual order for user: {}", user.getEmail());

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
                .orderReference(generateOrderReference())
                .build();

        items.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(user);

        try {
            emailService.sendOrderNotification(savedOrder, user);
            emailService.sendCustomerOrderReceiptHtml(savedOrder, user);
        } catch (Exception e) {
            log.warn("Email notifications failed: {}", e.getMessage());
        }

        return savedOrder;
    }

    @Override
    public void updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }

        orderRepository.save(order);
    }

    @Override
    public List<OrderDto> getOrdersForUser(User user) {
        return orderRepository.findByUser(user)
                .stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    @Override
    public OrderSummaryDTO getOrderSummary() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        return new OrderSummaryDTO(pending, delivered);
    }

    @Override
    public Optional<OrderDetailsDTO> getOrderByReference(String orderReference) {
        return orderRepository.findByOrderReference(orderReference)
                .map(this::mapToOrderDetailsDTO);
    }

    private OrderDetailsDTO mapToOrderDetailsDTO(Order order) {
        OrderDetailsDTO dto = new OrderDetailsDTO();
        dto.setOrderReference(order.getOrderReference());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCustomerName(order.getUser().getFullName());

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(OrderItemDTO::new)
                .toList();

        dto.setItems(itemDTOs);
        return dto;
    }

    private String generateOrderReference() {
        return "ORD-" + System.currentTimeMillis();
    }
}
