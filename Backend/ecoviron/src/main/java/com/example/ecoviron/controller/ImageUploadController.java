package com.example.ecoviron.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class ImageUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload/{folder}")
    public ResponseEntity<String> uploadImageToFolder(
            @PathVariable String folder,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate and clean filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            if (originalFilename.contains("..")) {
                return ResponseEntity.badRequest().body("Invalid file path.");
            }

            // Timestamp-based filename to avoid collisions
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String filename = timestamp + "_" + originalFilename;

            // Build final file path using the folder (e.g., blog, product)
            Path uploadPath = Paths.get(UPLOAD_DIR, folder);
            Files.createDirectories(uploadPath); // Ensure directory exists

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return frontend-accessible URL
            String imageUrl = "/uploads/" + folder + "/" + filename;
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
        }
    }

}
