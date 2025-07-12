package com.example.ecoviron.dto;

import com.example.ecoviron.entity.Order;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class OrderResponseDto {
    private Long id;
    private String orderReference;
    private String shippingAddress;
    private double totalAmount;
    private String status;
    private String userEmail;
    private LocalDateTime orderDate;
    private LocalDateTime paymentDate;


    public OrderResponseDto() {
        // Required for Jackson deserialization
    }

    public OrderResponseDto(Order order) {
        this.id = order.getId();
        this.orderReference = order.getOrderReference();
        this.shippingAddress = order.getShippingAddress();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus().toString();
        this.userEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        this.orderDate = order.getOrderDate();
        this.paymentDate = order.getPaymentDate();
    }
}
