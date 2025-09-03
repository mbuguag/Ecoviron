package com.example.ecoviron.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecoviron.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryStorageServiceImpl implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String saveFile(MultipartFile file, String folder) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString();

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", uniqueFileName,
                        "resource_type", "auto"
                ));

        return (String) uploadResult.get("secure_url");
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String publicId = folder + "/" + UUID.randomUUID();

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", publicId,
                        "overwrite", true,
                        "resource_type", "auto"
                )
        );

        return uploadResult.get("secure_url").toString();
    }

    @Override
    public String uploadBlogImage(MultipartFile file) throws IOException {
        return uploadFile(file, "blog-images");
    }

    @Override
    public String uploadProductImage(MultipartFile file) throws IOException {
        return uploadFile(file, "product-images");
    }

    @Override
    public String uploadProfilePicture(MultipartFile file) throws IOException {
        return uploadFile(file, "profile-pics");
    }

    @Override
    public void deleteFile(String publicIdOrUrl) throws IOException {
        if (publicIdOrUrl == null || publicIdOrUrl.isBlank()) return;

        String publicId = publicIdOrUrl;
        if (publicIdOrUrl.startsWith("http")) {
            publicId = extractPublicIdFromUrl(publicIdOrUrl);
        }

        if (publicId == null || publicId.isBlank()) return;

        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private String extractPublicIdFromUrl(String url) {
        try {
            String path = URI.create(url).getPath(); // /<cloud pieces>/image/upload/v.../folder/name.ext
            int uploadIdx = path.indexOf("/upload/");
            if (uploadIdx >= 0) {
                path = path.substring(uploadIdx + "/upload/".length());
            }
            // strip leading version like v17123456/
            path = path.replaceFirst("^v\\d+/", "");
            // remove extension
            path = path.replaceFirst("\\.[^.]+$", "");
            return path;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Cloudinary URL: " + url, e);
        }
    }
}
