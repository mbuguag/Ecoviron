package com.example.ecoviron.service;

import java.util.Map;

public interface PaymentService {
    void processMpesaCallback(Map<String, Object> callbackData);

}
