package com.example.ecoviron.service;

import com.example.ecoviron.dto.QuoteRequestDto;

import java.util.List;

public interface QuoteRequestService {
    void handleQuoteRequest(QuoteRequestDto dto);
    List<QuoteRequestDto> getAllRequests();

}
