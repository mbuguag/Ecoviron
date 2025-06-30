package com.example.ecoviron.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;

@RestController
@RequestMapping("/api/images")
@CrossOrigin
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/blog")
    public ResponseEntity<String> uploadBlogImage(@RequestParam("image") MultipartFile file) {
        try {
            // Clean file name
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            // Create file path
            Path filePath = Paths.get(UPLOAD_DIR + originalFilename);

            // Ensure directory exists
            Files.createDirectories(filePath.getParent());

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return image URL
            String imageUrl = "/uploads/" + originalFilename;
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Image upload failed: " + e.getMessage());
        }
    }
}

