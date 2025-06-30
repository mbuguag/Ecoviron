package com.example.ecoviron.controller;

import com.example.ecoviron.dto.MpesaPaymentRequest;
import com.example.ecoviron.service.MpesaPaymentService;
import com.example.ecoviron.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/payment")
@RequiredArgsConstructor
public class MpesaController {

    private final MpesaPaymentService mpesaPaymentService;
    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<String> initiatePayment(@RequestBody MpesaPaymentRequest request) {
        String result = mpesaPaymentService.initiateStkPush(
                request.getPhone(), request.getAmount(), request.getOrderReference()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> handleCallback(@RequestBody Map<String, Object> callbackPayload) {
        paymentService.processMpesaCallback(callbackPayload);
        return ResponseEntity.ok().build();
    }
}
