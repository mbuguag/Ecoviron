package com.example.ecoviron.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class ImageUploadController {

    @Value("${upload.base-path}")
    private String uploadBasePath;

    @PostMapping("/upload/{folder}")
    public ResponseEntity<String> uploadImageToFolder(
            @PathVariable String folder,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Create safe filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;

            // Create target directory
            Path uploadPath = Paths.get(uploadBasePath, folder);
            Files.createDirectories(uploadPath);

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative URL
            return ResponseEntity.ok("/uploads/" + folder + "/" + filename);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

}
