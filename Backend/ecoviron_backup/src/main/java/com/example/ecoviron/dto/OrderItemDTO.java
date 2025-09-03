package com.example.ecoviron.dto;

import com.example.ecoviron.entity.OrderItem;
import lombok.Data;

@Data
public class OrderItemDTO {
    private String productName;
    private int quantity;
    private double price;

    public OrderItemDTO(OrderItem item) {
        this.productName = item.getProduct().getName();
        this.quantity = item.getQuantity();
        this.price = item.getPrice();
    }
}
