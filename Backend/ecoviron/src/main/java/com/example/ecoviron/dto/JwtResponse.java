package com.example.ecoviron.dto;

import com.example.ecoviron.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String role;
    private Long userId;
    private String name;
    private String email;
    private Set<Role> roles;
}
