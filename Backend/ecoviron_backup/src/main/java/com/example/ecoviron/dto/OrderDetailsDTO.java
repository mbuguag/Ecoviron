package com.example.ecoviron.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailsDTO {
    private String orderReference;
    private LocalDateTime orderDate;
    private String status;
    private String shippingAddress;
    private double totalAmount;
    private String customerName;
    private List<OrderItemDTO> items;
}
