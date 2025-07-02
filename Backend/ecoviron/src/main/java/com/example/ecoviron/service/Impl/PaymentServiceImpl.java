package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.Payment;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.repository.PaymentRepository;
import com.example.ecoviron.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    @Override
    public void processMpesaCallback(Map<String, Object> callbackPayload) {
        Map<String, Object> body = (Map<String, Object>) callbackPayload.get("Body");
        if (body == null) return;

        Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");
        if (stkCallback == null) return;

        int resultCode = (int) stkCallback.get("ResultCode");
        if (resultCode != 0) return; // Payment failed or cancelled

        Map<String, Object> callbackMetadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
        if (callbackMetadata == null) return;

        // Extract all needed variables before the lambda
        final String orderReference = (String) stkCallback.get("CheckoutRequestID");
        final PaymentDetails paymentDetails = extractPaymentDetails(callbackMetadata);

        if (orderReference != null && paymentDetails.mpesaReceipt() != null) {
            orderRepository.findByOrderReference(orderReference).ifPresent(order -> {
                // Update order
                order.setStatus(OrderStatus.PAID);
                order.setPaymentReference(paymentDetails.mpesaReceipt());
                order.setPaymentDate(LocalDateTime.now());
                orderRepository.save(order);

                // Save payment
                Payment payment = Payment.builder()
                        .mpesaReceiptNumber(paymentDetails.mpesaReceipt())
                        .amount(paymentDetails.amount() != null ?
                                paymentDetails.amount() : order.getTotalAmount())
                        .phoneNumber(paymentDetails.phoneNumber())
                        .transactionDate(paymentDetails.transactionDate())
                        .status("SUCCESS")
                        .transactionType("STK_PUSH")
                        .orderReference(orderReference)
                        .order(order)
                        .build();

                paymentRepository.save(payment);
            });
        }
    }

    // Helper record to hold payment details
    private record PaymentDetails(
            String mpesaReceipt,
            Double amount,
            String phoneNumber,
            Date transactionDate
    ) {}

    private PaymentDetails extractPaymentDetails(Map<String, Object> callbackMetadata) {
        String mpesaReceipt = null;
        Double amount = null;
        String phoneNumber = null;
        Date transactionDate = new Date();

        for (Map<String, Object> item : (List<Map<String, Object>>) callbackMetadata.get("Item")) {
            String name = (String) item.get("Name");
            if ("MpesaReceiptNumber".equals(name)) {
                mpesaReceipt = (String) item.get("Value");
            } else if ("Amount".equals(name)) {
                amount = Double.valueOf(String.valueOf(item.get("Value")));
            } else if ("PhoneNumber".equals(name)) {
                phoneNumber = String.valueOf(item.get("Value"));
            } else if ("TransactionDate".equals(name)) {
            }
        }
        return new PaymentDetails(mpesaReceipt, amount, phoneNumber, transactionDate);
    }

}
