package com.example.ecoviron.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class StorageService {

    private final Cloudinary cloudinary;

    public StorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String saveBlogImage(MultipartFile file) throws IOException {
        return uploadFile(file, "blog-images");
    }

    public String saveProductImage(MultipartFile file) throws IOException {
        return uploadFile(file, "product-images");
    }

    public String saveProfilePicture(MultipartFile file) throws IOException {
        return uploadFile(file, "profile-pics");
    }

    private String uploadFile(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", file.getOriginalFilename(),
                        "resource_type", "auto"
                )
        );
        return uploadResult.get("secure_url").toString();
    }
}
