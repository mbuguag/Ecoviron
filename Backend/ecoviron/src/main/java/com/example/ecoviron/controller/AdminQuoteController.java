package com.example.ecoviron.controller;

import com.example.ecoviron.dto.QuoteRequestDto;
import com.example.ecoviron.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quotes")
@RequiredArgsConstructor
public class AdminQuoteController {

    private final QuoteRequestService quoteRequestService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuoteRequestDto>> getAllQuoteRequests() {
        List<QuoteRequestDto> quotes = quoteRequestService.getAllRequests();
        return ResponseEntity.ok(quotes);
    }
}

