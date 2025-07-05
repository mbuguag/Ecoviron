package com.example.ecoviron.controller;

import com.example.ecoviron.dto.OrderDetailsDTO;
import com.example.ecoviron.dto.OrderItemDTO;
import com.example.ecoviron.dto.OrderRequestDto;
import com.example.ecoviron.dto.OrderSummaryDTO;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    public record OrderResponse(Long id, String orderReference) {}


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
    public ResponseEntity<OrderResponse> saveOrder(
            @RequestBody OrderRequestDto orderDto,
            @RequestHeader("Authorization") String token) {

        User user = UserUtil.getUserFromToken(token);
        Order savedOrder = orderService.save(orderDto, user);

        return ResponseEntity.ok(new OrderResponse(savedOrder.getId(), savedOrder.getOrderReference()));
    }


    @GetMapping("/summary")
    public OrderSummaryDTO getOrderSummary() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        return new OrderSummaryDTO(pending, delivered);
    }

    @GetMapping("/{orderReference}")
    public ResponseEntity<OrderDetailsDTO> getOrderByReference(@PathVariable String orderReference) {
        return orderRepository.findByOrderReference(orderReference)
                .map(order -> ResponseEntity.ok(mapToOrderDetailsDTO(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    private OrderDetailsDTO mapToOrderDetailsDTO(Order order) {
        OrderDetailsDTO dto = new OrderDetailsDTO();
        dto.setOrderReference(order.getOrderReference());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCustomerName(order.getUser().getFullName());

        List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderItemDTO i = new OrderItemDTO();
            i.setProductName(item.getProduct().getName());
            i.setPrice(item.getPrice());
            i.setQuantity(item.getQuantity());
            return i;
        }).toList();

        dto.setItems(itemDTOs);
        return dto;
    }

}


