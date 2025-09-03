package com.example.ecoviron.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    private String token;
    private String fullName;
    private String email;
    private String role;
    private String profileImageUrl;
}
