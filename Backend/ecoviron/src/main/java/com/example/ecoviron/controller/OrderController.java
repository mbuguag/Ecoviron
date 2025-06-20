package com.example.ecoviron.controller;

import com.example.ecoviron.dto.OrderSummaryDTO;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;


    @PostMapping("/checkout")
    public Order checkout(@RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        return orderService.placeOrder(user);
    }

    @GetMapping
    public List<Order> getOrders(@RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        if (user.getRoles().equals("Role.ROLE_ADMIN")) {
            return orderService.getAllOrders();
        } else {
            return orderService.getOrdersByUser(user);
        }
    }

    @GetMapping("/summary")
    public OrderSummaryDTO getOrderSummary() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        return new OrderSummaryDTO(pending, delivered);
    }
}

