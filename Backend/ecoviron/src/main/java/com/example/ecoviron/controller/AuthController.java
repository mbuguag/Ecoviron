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
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
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
                            System.err.println("❌ Failed to create directory: " + uploadsDir);
                            return ResponseEntity.internalServerError().body("Failed to create upload directory.");
                        }
                    }

                    String originalFilename = profilePic.getOriginalFilename();
                    String sanitizedFilename = System.currentTimeMillis() + "_" +
                            originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                    File dest = new File(dir, sanitizedFilename);

                    System.out.println("✅ Saving image to: " + dest.getAbsolutePath());
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
            System.out.println("✅ Registered user: " + email);
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

        return ResponseEntity.ok(new JwtResponse(
                token,
                roles.get(0),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles(),
                user.getProfilePicture() // ✅ include profile image URL here
        ));
    }



}
