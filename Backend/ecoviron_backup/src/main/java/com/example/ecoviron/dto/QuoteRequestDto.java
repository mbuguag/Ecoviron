package com.example.ecoviron.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class QuoteRequestDto {
    private String name;
    private String email;
    private String service;
    private String message;
    private LocalDateTime submittedAt;
}
