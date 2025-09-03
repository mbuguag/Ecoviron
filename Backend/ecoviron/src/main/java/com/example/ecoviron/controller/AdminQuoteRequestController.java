package com.example.ecoviron.controller;

import com.example.ecoviron.dto.QuoteRequestDto;
import com.example.ecoviron.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quote-requests")
@RequiredArgsConstructor
public class AdminQuoteRequestController {
    private final QuoteRequestService quoteRequestService;

    @GetMapping
    public ResponseEntity<List<QuoteRequestDto>> getAllQuotes() {
        return ResponseEntity.ok(quoteRequestService.getAllRequests());
    }
}