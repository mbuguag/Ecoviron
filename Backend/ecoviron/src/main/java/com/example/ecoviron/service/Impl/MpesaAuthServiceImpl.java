package com.example.ecoviron.service.Impl;

import com.example.ecoviron.service.MpesaAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class MpesaAuthServiceImpl implements MpesaAuthService {

    @Value("${mpesa.consumerKey}")
    private String consumerKey;

    @Value("${mpesa.consumerSecret}")
    private String consumerSecret;

    @Value("${mpesa.baseUrl}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    //  Cached token and expiry
    private String cachedToken = null;
    private Instant tokenExpiry = Instant.EPOCH;

    @Override
    public synchronized String getAccessToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            System.out.println(" Using cached M-Pesa token");
            return cachedToken;
        }

        try {
            String credentials = consumerKey + ":" + consumerSecret;
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedCredentials);
            headers.set("Accept", "application/json");

            HttpEntity<?> entity = new HttpEntity<>(headers);
            String url = baseUrl + "/oauth/v1/generate?grant_type=client_credentials";

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println(" Failed to get access token. Status: " + response.getStatusCode());
                System.err.println("Response Body: " + response.getBody());
                throw new RuntimeException("M-Pesa token fetch failed");
            }

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("access_token") || !body.containsKey("expires_in")) {
                throw new RuntimeException("Missing access token or expiry in M-Pesa response.");
            }

            cachedToken = (String) body.get("access_token");
            int expiresInSeconds = Integer.parseInt(body.get("expires_in").toString());
            tokenExpiry = Instant.now().plusSeconds(expiresInSeconds - 60); // buffer of 60 seconds

            System.out.println(" Access Token Acquired and Cached: " + cachedToken);
            return cachedToken;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching M-Pesa access token: " + e.getMessage());
        }
    }
}
