package com.example.ecoviron.service;

public interface MpesaPaymentService {
    String initiateStkPush(String phone, String amount, String orderReference);

}
