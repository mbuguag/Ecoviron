package com.example.ecoviron.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {
    private String phone;
    private String amount;
    private String orderReference;
}
