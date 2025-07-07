package com.example.ecoviron.controller;

import com.example.ecoviron.dto.*;
import com.example.ecoviron.dto.UserLoginDto;
import com.example.ecoviron.entity.Role;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.ecoviron.security.JwtUtil;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

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

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> register(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic
    ) {
        try {
            // Check for existing user
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Email already in use");
            }

            // Handle profile picture upload
            String imageUrl = null;
            if (profilePic != null && !profilePic.isEmpty()) {
                try {
                    String uploadsDir = System.getProperty("user.dir") + "/uploads/profile-pics/";
                    File dir = new File(uploadsDir);
                    if (!dir.exists()) {
                        boolean created = dir.mkdirs();
                        if (!created) {
                            System.err.println(" Failed to create directory: " + uploadsDir);
                            return ResponseEntity.internalServerError().body("Failed to create upload directory.");
                        }
                    }

                    String originalFilename = profilePic.getOriginalFilename();
                    String sanitizedFilename = System.currentTimeMillis() + "_" +
                            originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                    File dest = new File(dir, sanitizedFilename);

                    System.out.println(" Saving image to: " + dest.getAbsolutePath());
                    profilePic.transferTo(dest);
                    imageUrl = "/uploads/profile-pics/" + sanitizedFilename;

                } catch (IOException e) {
                    e.printStackTrace();
                    return ResponseEntity.internalServerError().body("Failed to save profile picture.");
                }
            }

            // Save user
            User user = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .password(passwordEncoder.encode(password))
                    .profilePicture(imageUrl)
                    .roles(Set.of(Role.CUSTOMER))
                    .build();

            userRepository.save(user);
            System.out.println("Registered user: " + email);
            return ResponseEntity.ok("User registered successfully");

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("An unexpected error occurred during registration.");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .toList();

        String token = jwtUtil.generateToken(user.getEmail(), roles);

        // Construct and return the response
        AuthResponseDto response = new AuthResponseDto(
                token,
                user.getFullName(),
                user.getEmail(),
                roles.get(0), // assuming single role
                user.getProfilePicture() // can be null
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDto dto) {
        Optional<User> optionalUser = userRepository.findByEmail(dto.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Email not found");
        }

        User user = optionalUser.get();

        // Generate token & expiry
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30)); // expires in 30 mins
        userRepository.save(user);

        // TODO: Send email with reset link (e.g., /reset-password.html?token=...)
        System.out.println("Reset token for " + user.getEmail() + ": " + token);

        return ResponseEntity.ok("Reset instructions sent to your email (dev-mode: see console)");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDto dto) {
        Optional<User> optionalUser = userRepository.findByResetToken(dto.getToken());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }

        User user = optionalUser.get();

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successful");
    }


}
