package com.example.ecoviron.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    String saveFile(MultipartFile file, String folder) throws IOException;
    String uploadFile(MultipartFile file, String folder) throws IOException;

    String uploadBlogImage(MultipartFile file) throws IOException;

    String uploadProductImage(MultipartFile file) throws IOException;

    String uploadProfilePicture(MultipartFile file) throws IOException;

//    Map deleteFile(String publicId) throws IOException;

    void deleteFile(String publicIdOrUrl) throws IOException;
}
