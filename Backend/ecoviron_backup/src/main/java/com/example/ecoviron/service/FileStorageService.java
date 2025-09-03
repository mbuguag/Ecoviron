package com.example.ecoviron.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    String saveFile(MultipartFile file, String subDir) throws IOException;

}
