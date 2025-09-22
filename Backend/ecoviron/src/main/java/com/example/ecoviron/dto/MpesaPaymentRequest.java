package com.example.ecoviron.dto;

import lombok.Data;

@Data
public class MpesaPaymentRequest {
    private String phone;
    private double amount;
    private String orderReference;
}
