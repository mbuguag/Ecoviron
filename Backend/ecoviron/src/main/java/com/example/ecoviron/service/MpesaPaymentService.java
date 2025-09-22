package com.example.ecoviron.service;

import com.example.ecoviron.dto.MpesaPaymentResponseDto;

public interface MpesaPaymentService {
    MpesaPaymentResponseDto initiateStkPush(String phone, double amount, String orderReference);
}
