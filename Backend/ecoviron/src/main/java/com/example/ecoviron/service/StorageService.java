package com.example.ecoviron.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${upload.base-path}")
    private String basePath;

    @Value("${upload.profile-path}")
    private String profilePath;

    @Value("${upload.product-path}")
    private String productPath;

    public String saveBlogImage(MultipartFile file) throws IOException {
        return saveFile(file, "blog-images");
    }

    public String saveFile(MultipartFile file, String subDir) throws IOException {
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path dirPath = Paths.get(basePath, subDir).toAbsolutePath();
        Files.createDirectories(dirPath); // create if not exists

        Path target = dirPath.resolve(filename);
        file.transferTo(target);

        return "/uploads/" + subDir + "/" + filename;
    }

    public String saveProductImage(MultipartFile file) throws IOException {
        return saveFile(file, "product-images");
    }

    public String saveProfilePicture(MultipartFile file) throws IOException {
        return saveFile(file, "profile-pics");
    }

    public Resource load(String filename, String subDir) throws MalformedURLException {
        Path filePath = Paths.get(basePath, subDir).resolve(filename).normalize().toAbsolutePath();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found: " + filename);
        }
    }
}
