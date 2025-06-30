package com.example.ecoviron.service.Impl;

import com.example.ecoviron.service.MpesaAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;

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

    @Override
    public String getAccessToken() {
        String auth = Base64.getEncoder().encodeToString((consumerKey + ":" + consumerSecret).getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + auth);

        HttpEntity<?> entity = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/oauth/v1/generate?grant_type=client_credentials",
                HttpMethod.GET, entity, Map.class);

        return (String) response.getBody().get("access_token");
    }
}
