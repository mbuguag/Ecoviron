package com.example.ecoviron.controller;

import com.example.ecoviron.dto.*;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.MpesaPaymentService;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.service.UserService;
import com.example.ecoviron.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final MpesaPaymentService mpesaPaymentService;

    public record OrderResponse(Long id, String orderReference) {}

    // Checkout from cart + auto initiate Mpesa payment
    @PostMapping("/checkout")
    public ResponseEntity<MpesaPaymentResponseDto> checkout(
            @RequestHeader("Authorization") String token,
            @RequestBody MpesaPaymentRequest paymentRequest // include phone number
    ) {
        User user = UserUtil.getUserFromToken(token);

        // 1. Place the order
        Order savedOrder = orderService.placeOrder(user);

        // 2. Trigger Mpesa STK push → returns structured response
        MpesaPaymentResponseDto stkResponse = mpesaPaymentService.initiateStkPush(
                paymentRequest.getPhone(),
                savedOrder.getTotalAmount(),
                savedOrder.getOrderReference()
        );

        // 3. Save payment reference in order
        savedOrder.setPaymentReference(stkResponse.getCheckoutRequestId());
        savedOrder.setStatus(OrderStatus.PENDING);
        orderRepository.save(savedOrder);

        // 4. Return full Mpesa response to frontend (same as /payment/pay)
        return ResponseEntity.ok(stkResponse);
    }


    // ✅ Get all orders (admin) or only current user's orders
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public List<OrderResponseDto> getOrders() {
        User user = userService.getCurrentUser();

        List<Order> orders = user.getRoles().stream()
                .anyMatch(role -> role.name().equals("ADMIN"))
                ? orderService.getAllOrders()
                : orderService.getOrdersByUser(user);

        return orders.stream().map(OrderResponseDto::new).toList();
    }

    // ✅ Save manual order
    @PostMapping("/save")
    public ResponseEntity<OrderDto> saveOrder(
            @RequestBody OrderRequestDto orderDto,
            @RequestHeader("Authorization") String token) {

        User user = UserUtil.getUserFromToken(token);
        Order savedOrder = orderService.save(orderDto, user);
        return ResponseEntity.ok(new OrderDto(savedOrder));
    }

    // ✅ Order summary for dashboard
    @GetMapping("/summary")
    public OrderSummaryDTO getOrderSummary() {
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        return new OrderSummaryDTO(pending, delivered);
    }

    // ✅ Update order status (Admin only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDto statusUpdateDto) {

        orderService.updateStatus(id, statusUpdateDto.getStatus());
        return ResponseEntity.ok().build();
    }

    // ✅ Get order by reference (any user)
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

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(OrderItemDTO::new)
                .toList();

        dto.setItems(itemDTOs);
        return dto;
    }

    // ✅ Current user's orders
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderDto>> getMyOrders() {
        User user = userService.getCurrentUser();
        List<OrderDto> orders = orderService.getOrdersForUser(user);
        return ResponseEntity.ok(orders);
    }

    // --- Extra DTO for response ---
    public record OrderCheckoutResponse(OrderDto order, String checkoutRequestId) {}
}
