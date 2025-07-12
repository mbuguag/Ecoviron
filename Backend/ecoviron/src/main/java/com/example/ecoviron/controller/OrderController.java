package com.example.ecoviron.controller;

import com.example.ecoviron.dto.*;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;

import static com.example.ecoviron.util.UserUtil.userRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public List<OrderResponseDto> getOrders(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Order> orders = user.getRoles().stream()
                .anyMatch(role -> role.name().equals("ADMIN"))
                ? orderService.getAllOrders()
                : orderService.getOrdersByUser(user);

        return orders.stream().map(OrderResponseDto::new).toList();
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

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDto statusUpdateDto) {

        orderService.updateStatus(id, statusUpdateDto.getStatus());
        return ResponseEntity.ok().build();
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


