package com.example.ecoviron.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class PaymentRequest {
    private String phone;
    private String amount;
    private String orderReference;
}
