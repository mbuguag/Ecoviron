package com.example.ecoviron.controller;

import com.example.ecoviron.dto.OrderSummaryDTO;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
=======
import org.springframework.security.core.annotation.AuthenticationPrincipal;
>>>>>>> 0adeff7a2bbf24d66d8ba480a90d3600e36c7eeb
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    public record OrderResponse(String orderReference) {}


    @PostMapping("/save")
    public ResponseEntity<OrderResponse> saveOrder(@RequestBody OrderRequestDto orderDto, @AuthenticationPrincipal User user) {
        Order savedOrder = orderService.save(orderDto, user);
        return ResponseEntity.ok(new OrderResponse(savedOrder.getOrderReference()));
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        return orderService.placeOrder(user);
    }

    @GetMapping
    public List<Order> getOrders(@RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        if (user.getRoles().stream().anyMatch(role -> role.name().equals("ADMIN"))) {

            return orderService.getAllOrders();
        } else {
            return orderService.getOrdersByUser(user);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Order> saveOrder(
            @RequestBody Order order,
            @RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        Order savedOrder = orderService.saveOrder(order, user);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/summary")
    public OrderSummaryDTO getOrderSummary() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        return new OrderSummaryDTO(pending, delivered);
    }

    @GetMapping("/{orderReference}")
    public ResponseEntity<Order> getOrderByReference(@PathVariable String orderReference) {
        return orderRepository.findByOrderReference(orderReference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}


