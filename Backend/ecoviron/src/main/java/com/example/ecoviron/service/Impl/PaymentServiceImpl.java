package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.Payment;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.repository.PaymentRepository;
import com.example.ecoviron.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.ecoviron.entity.OrderStatus;


import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Override
    public void processMpesaCallback(Map<String, Object> callbackData) {
        try {
            Map<String, Object> body = (Map<String, Object>) callbackData.get("Body");
            Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");

            int resultCode = (int) stkCallback.get("ResultCode");
            String resultDesc = (String) stkCallback.get("ResultDesc");
            String status = resultCode == 0 ? "SUCCESS" : "FAILED";

            Map<String, Object> metadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
            Map<String, Object> itemMap = new java.util.HashMap<>();

            for (Map<String, Object> item : (java.util.List<Map<String, Object>>) metadata.get("Item")) {
                itemMap.put((String) item.get("Name"), item.get("Value"));
            }

            String receipt = (String) itemMap.get("MpesaReceiptNumber");
            Double amount = Double.valueOf(itemMap.get("Amount").toString());
            String phone = itemMap.get("PhoneNumber").toString();
            String transactionDateString = itemMap.get("TransactionDate").toString();
            String orderReference = (String) itemMap.get("AccountReference");

            Date transactionDate = new SimpleDateFormat("yyyyMMddHHmmss").parse(transactionDateString);

            Order order = orderRepository.findByOrderReference(orderReference).orElse(null);

            Payment payment = Payment.builder()
                    .amount(amount)
                    .mpesaReceiptNumber(receipt)
                    .phoneNumber(phone)
                    .transactionDate(transactionDate)
                    .orderReference(orderReference)
                    .transactionType("STK_PUSH")
                    .status(status)
                    .order(order)
                    .build();

            paymentRepository.save(payment);

            // Optionally update order status
            if (order != null && resultCode == 0) {
                order.setStatus(OrderStatus.PAID); ;
                orderRepository.save(order);
            }

        } catch (Exception e) {
            System.err.println("Failed to parse callback: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

