package com.example.ecoviron.dto;

import lombok.Data;

@Data
public class MpesaPaymentRequest {
    private String phone;
    private String amount;
    private String orderReference;
}
