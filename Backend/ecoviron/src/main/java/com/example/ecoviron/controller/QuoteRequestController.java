package com.example.ecoviron.controller;

import com.example.ecoviron.dto.QuoteRequestDto;
import com.example.ecoviron.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quote")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class QuoteRequestController {
    private final QuoteRequestService quoteRequestService;

    @PostMapping("/request")
    public ResponseEntity<String> submitQuote(@RequestBody QuoteRequestDto dto) {
        System.out.println("Quote endpoint HIT");
        quoteRequestService.handleQuoteRequest(dto);
        return ResponseEntity.ok("Quote request submitted successfully.");
    }
}
