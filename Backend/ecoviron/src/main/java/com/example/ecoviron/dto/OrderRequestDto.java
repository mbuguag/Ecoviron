package com.example.ecoviron.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {
    private List<OrderItemDto> items;
    private double totalAmount;
    private String paymentMethod;

    private CustomerDetails customerDetails;

    @Data
    public static class OrderItemDto {
        private Long productId;
        private int quantity;
        private String name;
        private double price;
    }

    @Data
    public static class CustomerDetails {
        private String name;
        private String email;
        private String shippingAddress;
    }
}

