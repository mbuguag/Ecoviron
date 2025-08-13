package com.example.ecoviron.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import com.example.ecoviron.entity.Role;
@Data
public class UserRegisterDto {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private Role role;
}
