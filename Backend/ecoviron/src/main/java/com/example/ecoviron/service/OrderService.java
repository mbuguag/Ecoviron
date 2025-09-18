package com.example.ecoviron.service;

import com.example.ecoviron.dto.OrderDto;
import com.example.ecoviron.dto.OrderRequestDto;
import com.example.ecoviron.dto.OrderSummaryDTO;
import com.example.ecoviron.dto.OrderDetailsDTO;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    Order placeOrder(User user);

    List<Order> getAllOrders();

    List<Order> getOrdersByUser(User user);

    Order save(OrderRequestDto orderDto, User user);

    void updateStatus(Long id, String status);

    List<OrderDto> getOrdersForUser(User user);

    /**
     * Returns order summary (pending, delivered counts).
     */
    OrderSummaryDTO getOrderSummary();

    /**
     * Returns order details by order reference.
     */
    Optional<OrderDetailsDTO> getOrderByReference(String orderReference);
}
