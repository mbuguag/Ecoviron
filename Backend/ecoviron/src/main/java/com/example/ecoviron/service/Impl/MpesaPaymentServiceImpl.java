package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.MpesaPaymentResponseDto;
import com.example.ecoviron.service.MpesaAuthService;
import com.example.ecoviron.service.MpesaPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MpesaPaymentServiceImpl implements MpesaPaymentService {

    private final MpesaAuthService mpesaAuthService;

    @Value("${mpesa.shortCode}")
    private String shortCode;

    @Value("${mpesa.passkey}")
    private String passkey;

    @Value("${mpesa.callbackUrl}")
    private String callbackUrl;

    @Value("${mpesa.baseUrl}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public MpesaPaymentResponseDto initiateStkPush(String phone, double amount, String orderReference) {
        try {
            // ✅ Validate phone number
            if (phone == null || phone.isEmpty() || !phone.matches("^254[17]\\d{8}$")) {
                throw new IllegalArgumentException("Invalid phone number: " + phone);
            }

            // ✅ Step 1: Get Access Token
            String token = mpesaAuthService.getAccessToken();

            // ✅ Step 2: Generate Timestamp & Password
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            String password = Base64.getEncoder().encodeToString(
                    (shortCode + passkey + timestamp).getBytes(StandardCharsets.UTF_8)
            );

            // ✅ Step 3: Construct Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("BusinessShortCode", shortCode);
            payload.put("Password", password);
            payload.put("Timestamp", timestamp);
            payload.put("TransactionType", "CustomerPayBillOnline");
            payload.put("Amount", amount);
            payload.put("PartyA", phone);
            payload.put("PartyB", shortCode);
            payload.put("PhoneNumber", phone);
            payload.put("CallBackURL", callbackUrl);
            payload.put("AccountReference", orderReference);
            payload.put("TransactionDesc", "Order Payment");

            // ✅ Step 4: Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            String stkPushUrl = baseUrl + "/mpesa/stkpush/v1/processrequest";

            // ✅ Step 5: Execute POST request and map response
            ResponseEntity<MpesaPaymentResponseDto> response = restTemplate.postForEntity(
                    stkPushUrl, request, MpesaPaymentResponseDto.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Failed to initiate STK Push: " + e.getMessage(), e);
        }
    }

}
