package com.example.ecoviron.controller;

import com.example.ecoviron.dto.QuoteRequestDto;
import com.example.ecoviron.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quote")
@RequiredArgsConstructor
@CrossOrigin
public class QuoteRequestController {
    private final QuoteRequestService quoteRequestService;

    @PostMapping("/request")
    public ResponseEntity<String> submitQuote(@RequestBody QuoteRequestDto dto) {
        System.out.println("Quote endpoint HIT");
        quoteRequestService.handleQuoteRequest(dto);
        return ResponseEntity.ok("Quote request submitted successfully.");
    }
}
