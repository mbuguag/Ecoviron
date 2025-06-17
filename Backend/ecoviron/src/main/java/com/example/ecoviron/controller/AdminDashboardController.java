package com.example.ecoviron.controller;

import com.example.ecoviron.dto.AdminSummaryDTO;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.repository.ProductRepository;
import com.example.ecoviron.repository.UserRepository;
import com.example.ecoviron.entity.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/summary")
    public AdminSummaryDTO getAdminSummary() {
        AdminSummaryDTO summary = new AdminSummaryDTO();
        summary.setTotalOrders(orderRepository.count());
        summary.setTotalUsers(userRepository.count());
        summary.setTotalProducts(productRepository.count());

        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("pending", orderRepository.countByStatus(OrderStatus.PENDING));
        statusMap.put("shipped", orderRepository.countByStatus(OrderStatus.SHIPPED));
        statusMap.put("delivered", orderRepository.countByStatus(OrderStatus.DELIVERED));
        summary.setOrderStatus(statusMap);

        return summary;
    }
}
