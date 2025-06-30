package com.example.ecoviron.service.Impl;

import com.example.ecoviron.service.MpesaAuthService;
import com.example.ecoviron.service.MpesaPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


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

    @Override
    public String initiateStkPush(String phone, String amount, String orderReference) {
        String token = mpesaAuthService.getAccessToken();
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        String password = Base64.getEncoder().encodeToString(
                (shortCode + passkey + timestamp).getBytes(StandardCharsets.UTF_8));

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

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/mpesa/stkpush/v1/processrequest", request, String.class);

        return response.getBody();
    }
}
