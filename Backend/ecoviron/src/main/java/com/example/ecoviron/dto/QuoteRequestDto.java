package com.example.ecoviron.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteRequestDto {
    private String name;
    private String email;
    private String service;
    private String message;
}
