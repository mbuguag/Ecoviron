package com.example.ecoviron.controller;

import com.example.ecoviron.dto.MpesaPaymentRequest;
import com.example.ecoviron.dto.MpesaPaymentResponseDto;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.MpesaPaymentService;
import com.example.ecoviron.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class MpesaController {

    private final MpesaPaymentService mpesaPaymentService;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    /**
     * Step 1: User initiates STK push for payment
     */
    @PostMapping("/pay")
    public ResponseEntity<MpesaPaymentResponseDto> initiatePayment(@RequestBody MpesaPaymentRequest request) {
        log.info("📤 Initiating Mpesa payment for order={} phone={} amount={}",
                request.getOrderReference(), request.getPhone(), request.getAmount());

        // Call M-Pesa STK push and get structured response
        MpesaPaymentResponseDto stkResponse = mpesaPaymentService.initiateStkPush(
                request.getPhone(), request.getAmount(), request.getOrderReference()
        );

        // Link checkoutRequestId with the order
        orderRepository.findByOrderReference(request.getOrderReference())
                .ifPresent(order -> {
                    order.setPaymentReference(stkResponse.getCheckoutRequestId());
                    orderRepository.save(order);
                    log.info("🔗 Linked CheckoutRequestID {} to Order {}",
                            stkResponse.getCheckoutRequestId(), order.getOrderReference());
                });

        return ResponseEntity.ok(stkResponse);
    }

    /**
     * Step 2: Safaricom calls back here after STK push result
     */
    @PostMapping("/callback")
    public ResponseEntity<Void> handleCallback(@RequestBody Map<String, Object> callbackPayload) {
        log.info("📥 Mpesa Callback received: {}", callbackPayload);
        paymentService.processMpesaCallback(callbackPayload);
        return ResponseEntity.ok().build();
    }
}
