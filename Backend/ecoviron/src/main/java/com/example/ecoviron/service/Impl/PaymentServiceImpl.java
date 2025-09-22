package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderStatus;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.OrderRepository;
import com.example.ecoviron.service.EmailService;
import com.example.ecoviron.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final EmailService emailService; // ✅ inject EmailService

    @Override
    @Transactional
    public void processMpesaCallback(Map<String, Object> callbackData) {
        try {
            JSONObject json = new JSONObject(callbackData);
            JSONObject body = json.getJSONObject("Body").getJSONObject("stkCallback");

            int resultCode = body.getInt("ResultCode");
            String checkoutRequestId = body.getString("CheckoutRequestID");
            String resultDesc = body.getString("ResultDesc");

            log.info("📩 Mpesa Callback received: resultCode={}, resultDesc={}, checkoutRequestId={}",
                    resultCode, resultDesc, checkoutRequestId);

            Optional<Order> optionalOrder = orderRepository.findByPaymentReference(checkoutRequestId);

            if (optionalOrder.isEmpty()) {
                log.error("No order found for CheckoutRequestID: {}", checkoutRequestId);
                return;
            }

            Order order = optionalOrder.get();
            User user = order.getUser();

            if (resultCode == 0) {
                order.setStatus(OrderStatus.PAID);
                log.info("✅ Order {} marked as PAID", order.getOrderReference());

                // 🔔 Send email notifications
                emailService.sendCustomerOrderReceiptHtml(order, user);
                emailService.sendOrderNotification(order, user);

            } else {
                order.setStatus(OrderStatus.CANCELLED);
                log.warn("⚠️ Order {} marked as CANCELLED (ResultCode={}, Desc={})",
                        order.getOrderReference(), resultCode, resultDesc);

                // 🔔 Notify customer about failed/cancelled payment
                emailService.sendPaymentFailedEmail(order, user, resultDesc); // ✅ call via emailService
            }

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("💥 Error processing Mpesa callback", e);
            throw new RuntimeException("Failed to process Mpesa callback", e);
        }
    }

}
