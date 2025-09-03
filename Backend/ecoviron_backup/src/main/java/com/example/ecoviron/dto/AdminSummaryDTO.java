package com.example.ecoviron.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminSummaryDTO {
    private long totalOrders;
    private long totalUsers;
    private long totalProducts;
    private Map<String, Long> orderStatus;
}
