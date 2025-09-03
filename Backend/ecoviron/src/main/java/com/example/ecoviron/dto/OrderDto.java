package com.example.ecoviron.dto;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Data
public class OrderDto {
    private Long id;
    private String orderReference;
    private LocalDateTime orderDate;
    private double totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private List<OrderItemDTO> items;

    public OrderDto(Order order) {
        this.id = order.getId();
        this.orderReference = order.getOrderReference();
        this.orderDate = order.getOrderDate();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.shippingAddress = order.getShippingAddress();
        this.items = order.getItems().stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }
}
