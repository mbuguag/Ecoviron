package com.example.ecoviron.controller;

import com.example.ecoviron.dto.*;
import com.example.ecoviron.dto.UserLoginDto;
import com.example.ecoviron.entity.Role;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.ecoviron.security.JwtUtil;


import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UserRegisterDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())){
            return ResponseEntity.badRequest().body("Email already in use");
        }

        Role assignedRole = dto.getRole() != null ? dto.getRole() : Role.CUSTOMER;
        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .roles(Set.of((Role) assignedRole))
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");

    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        // 👇 Extract roles as strings
        List<String> roles = user.getRoles().stream()
                .map(Enum::name) // e.g., ADMIN, CUSTOMER
                .toList();

        // 👇 Generate token with roles
        String token = jwtUtil.generateToken(user.getEmail(), roles);

        return ResponseEntity.ok(new JwtResponse(
                token,
                roles.get(0), // first role, e.g. "ADMIN"
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles()
        ));
    }


}
